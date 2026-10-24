import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authorization = request.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    let user: any = null;
    if (authorization) {
      const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
      const { data, error } = await caller.auth.getUser();
      if (!error) user = data.user;
    }
    const { phoneNumber, invoiceNumber, guestToken } = await request.json();
    if (typeof invoiceNumber !== 'string' || typeof phoneNumber !== 'string') return Response.json({ error: 'Invoice and phone number are required' }, { status: 400, headers: cors });
    let phone = phoneNumber.replace(/\D/g, '');
    if (/^0[17]\d{8}$/.test(phone)) phone = `254${phone.slice(1)}`;
    else if (/^[17]\d{8}$/.test(phone)) phone = `254${phone}`;
    if (!/^254[17]\d{8}$/.test(phone)) return Response.json({ error: 'Enter a valid Kenyan M-Pesa phone number' }, { status: 400, headers: cors });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: invoice, error: invoiceError } = await admin.from('invoices').select('id,invoice_number,user_id,guest_token,total_amount,status,customer_name').eq('invoice_number', invoiceNumber).maybeSingle();
    if (invoiceError || !invoice) return Response.json({ error: 'Invoice was not found' }, { status: 404, headers: cors });
    let allowed = Boolean(user && invoice.user_id === user.id);
    if (typeof guestToken === 'string' && guestToken.length >= 32 && guestToken === invoice.guest_token) allowed = true;
    if (!allowed) return Response.json({ error: 'You are not authorized to pay this invoice' }, { status: 403, headers: cors });
    if (invoice.status !== 'pending') return Response.json({ error: 'This invoice is no longer awaiting payment' }, { status: 409, headers: cors });
    if (!Number.isInteger(Number(invoice.total_amount))) return Response.json({ error: 'PayHero M-Pesa payments require a whole-KES invoice total' }, { status: 400, headers: cors });

    const basicAuth = Deno.env.get('PAYHERO_BASIC_AUTH');
    const channelId = Deno.env.get('PAYHERO_CHANNEL_ID') || '14421';
    const callbackSecret = Deno.env.get('PAYHERO_CALLBACK_SECRET');
    if (!basicAuth) return Response.json({ error: 'PayHero is not configured: add the PAYHERO_BASIC_AUTH secret to Supabase Edge Function secrets.' }, { status: 503, headers: cors });
    if (!callbackSecret) return Response.json({ error: 'Payments are not fully configured: add the PAYHERO_CALLBACK_SECRET secret to Supabase Edge Function secrets.' }, { status: 503, headers: cors });
    if (!/^\d+$/.test(channelId)) return Response.json({ error: 'PayHero channel configuration is invalid. Set PAYHERO_CHANNEL_ID to the numeric channel ID.' }, { status: 503, headers: cors });
    // Match the PHP integration: accept a raw token or a complete Basic header. Secrets
    // copied from env files are often wrapped in quotes or folded across lines; normalize
    // that formatting without logging or otherwise exposing the token.
    let token = basicAuth.trim();
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      token = token.slice(1, -1).trim();
    }
    token = token.replace(/[\r\n]/g, '').trim();
    token = token.replace(/^Authorization:\s*/i, '');
    const authorizationValue = /^Basic\s/i.test(token) ? token : `Basic ${token}`;
    if (!token || /[\r\n\u0000-\u001f\u007f"']/.test(authorizationValue)) {
      return Response.json({ error: 'PayHero authorization value contains invalid header characters. Check the PAYHERO_BASIC_AUTH secret formatting.' }, { status: 503, headers: cors });
    }
    try {
      new Headers({ Authorization: authorizationValue, 'Content-Type': 'application/json' });
    } catch (error) {
      console.error('PayHero authorization header failed validation:', error instanceof Error ? error.message : 'invalid header');
      return Response.json({ error: 'PayHero authorization value is not a valid HTTP header. Check the PAYHERO_BASIC_AUTH secret formatting.' }, { status: 503, headers: cors });
    }
    const callbackUrl = `${supabaseUrl}/functions/v1/payhero-callback?secret=${encodeURIComponent(callbackSecret)}`;
    let payheroResponse: Response;
    try {
      payheroResponse = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
        method: 'POST',
        headers: { Authorization: authorizationValue, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ amount: Number(invoice.total_amount), phone_number: phone, channel_id: Number(channelId), provider: 'm-pesa', external_reference: invoice.invoice_number, customer_name: invoice.customer_name, callback_url: callbackUrl }),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      console.error('PayHero request could not reach provider:', error);
      return Response.json({ error: 'Could not connect to PayHero. Please try again shortly.' }, { status: 502, headers: cors });
    }
    const responseText = await payheroResponse.text();
    let result: Record<string, unknown> = {};
    try { result = responseText ? JSON.parse(responseText) : {}; } catch { /* PayHero may return a plain-text gateway error. */ }
    if (!payheroResponse.ok || result.success === false) {
      const detail = typeof result.message === 'string' ? result.message : typeof result.error === 'string' ? result.error : responseText.slice(0, 300);
      console.error('PayHero rejected STK request:', payheroResponse.status, detail);
      return Response.json({ error: detail ? `PayHero could not start the M-Pesa request: ${detail}` : `PayHero could not start the M-Pesa request (HTTP ${payheroResponse.status}).` }, { status: 502, headers: cors });
    }
    const checkoutRequestId = result.CheckoutRequestID ?? result.checkout_request_id;
    if (typeof checkoutRequestId !== 'string' || !checkoutRequestId.trim()) {
      console.error('PayHero accepted request without a CheckoutRequestID:', payheroResponse.status, responseText.slice(0, 300));
      return Response.json({ error: 'PayHero accepted the request but returned no checkout ID, so payment status cannot be tracked. Contact support before retrying.' }, { status: 502, headers: cors });
    }
    const { error: paymentError } = await admin.from('payments').insert({ invoice_id: invoice.id, user_id: user?.id ?? null, transaction_id: checkoutRequestId, phone_number: phone, amount: Number(invoice.total_amount), status: 'pending' });
    if (paymentError) {
      console.error('PayHero STK started but payment record could not be saved:', paymentError);
      return Response.json({ error: 'The M-Pesa prompt was sent, but we could not save its payment record. Please contact support before retrying.' }, { status: 500, headers: cors });
    }
    return Response.json({ ResponseCode: '0', ResponseDescription: result.status || 'QUEUED', CustomerMessage: 'Check your phone and enter your M-Pesa PIN.', CheckoutRequestID: checkoutRequestId, MerchantRequestID: result.reference || '' }, { headers: cors });
  } catch (error) {
    console.error('PayHero STK initiation failed:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Could not start payment' }, { status: 500, headers: cors });
  }
});
