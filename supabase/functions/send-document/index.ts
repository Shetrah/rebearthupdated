import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'POST required' }, { status: 405, headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization');
    const url = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return Response.json({ error: 'Email service is not fully configured in Supabase.' }, { status: 503, headers: corsHeaders });
    let user: any = null;
    if (authorization && anonKey) {
      const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
      const { data, error: authError } = await callerClient.auth.getUser();
      if (!authError) user = data.user;
    }

    const { to, customerName, invoiceNumber, type, pdfBase64, guestToken } = await request.json();
    if (typeof to !== 'string' || !to.includes('@') || typeof invoiceNumber !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(invoiceNumber) || typeof pdfBase64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64) || pdfBase64.length > 8_000_000 || !['invoice','receipt'].includes(type)) {
      return Response.json({ error: 'Invalid document details' }, { status: 400, headers: corsHeaders });
    }
    const adminClient = createClient(url, serviceKey);
    const { data: invoice, error: invoiceError } = await adminClient.from('invoices').select('user_id,customer_email,guest_token').eq('invoice_number', invoiceNumber).maybeSingle();
    if (invoiceError) throw invoiceError;
    if (!invoice) return Response.json({ error: 'Invoice record was not found' }, { status: 404, headers: corsHeaders });
    let isAdmin = false;
    if (user) {
      const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
      isAdmin = profile?.role === 'admin';
    }
    const tokenMatches = typeof guestToken === 'string' && guestToken.length >= 32 && guestToken === invoice.guest_token;
    if (!isAdmin && !tokenMatches && !(user && invoice.user_id === user.id)) {
      return Response.json({ error: 'You cannot email another customer’s invoice' }, { status: 403, headers: corsHeaders });
    }
    if (to.trim().toLowerCase() !== String(invoice.customer_email || '').trim().toLowerCase()) return Response.json({ error: 'Recipient does not match the invoice email' }, { status: 400, headers: corsHeaders });
    const isReceipt = type === 'receipt';
    const subject = `${isReceipt ? 'Your Rebearth payment receipt' : 'Your Rebearth invoice'} · ${invoiceNumber}`;
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => {
      if (character === '&') return '&amp;';
      if (character === '<') return '&lt;';
      if (character === '>') return '&gt;';
      if (character === '"') return '&quot;';
      return '&#39;';
    });
    const safeName = escapeHtml(typeof customerName === 'string' ? customerName : 'Customer');
    const safeInvoiceNumber = escapeHtml(invoiceNumber);
    const html = `<div style="font-family:Arial,sans-serif;background:#f2f7f3;padding:32px;color:#16372c"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden"><div style="background:#0c2f27;padding:28px;color:white"><div style="font-size:20px;font-weight:bold">REBEARTH SOLUTIONS</div><div style="margin-top:6px;color:#b7e8ce">Sustainable agriculture. Stronger harvests.</div></div><div style="padding:28px"><p>Hello ${safeName},</p><p>${isReceipt ? 'Thank you. Your payment is confirmed and your receipt is attached.' : 'Your invoice is ready. The PDF is attached for your records and payment reference.'}</p><p style="padding:14px;background:#eff8f2;border-radius:10px"><strong>${isReceipt ? 'Receipt' : 'Invoice'} ${safeInvoiceNumber}</strong></p><p style="color:#60746a;font-size:13px">Questions? Reply to this email or contact info@rebearthsolutions.com.</p></div></div></div>`;
    const cleanSetting = (value: string | undefined) => {
      if (!value) return '';
      let cleaned = value.trim();
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) cleaned = cleaned.slice(1, -1).trim();
      return cleaned.replace(/[\r\n]/g, '').trim();
    };
    const resendKey = cleanSetting(Deno.env.get('RESEND_API_KEY'));
    const from = cleanSetting(Deno.env.get('RESEND_FROM_EMAIL'));
    if (!resendKey) return Response.json({ error: 'Email is not configured: add a valid RESEND_API_KEY secret in Supabase.' }, { status: 503, headers: corsHeaders });
    if (!from || !from.includes('@')) return Response.json({ error: 'Email sender is not configured. Set RESEND_FROM_EMAIL to an address on a domain verified in Resend.' }, { status: 503, headers: corsHeaders });

    let resendResponse: Response;
    try {
      resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ from, to: [to.trim()], subject, html, attachments: [{ filename: `${type}_${invoiceNumber}.pdf`, content: pdfBase64 }] }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (error) {
      console.error('Resend request failed:', error instanceof Error ? error.message : 'network error');
      return Response.json({ error: 'Could not connect to Resend. Please retry email delivery shortly.' }, { status: 502, headers: corsHeaders });
    }
    const responseText = await resendResponse.text();
    let result: Record<string, unknown> = {};
    try { result = responseText ? JSON.parse(responseText) : {}; } catch { /* retain HTTP status for non-JSON provider responses */ }
    if (!resendResponse.ok || typeof result.id !== 'string') {
      const providerMessage = typeof result.message === 'string' ? result.message : typeof result.error === 'string' ? result.error : `Resend returned HTTP ${resendResponse.status}`;
      console.error('Resend rejected document email:', resendResponse.status, providerMessage);
      return Response.json({ error: `Resend could not send the ${type}: ${providerMessage}` }, { status: 502, headers: corsHeaders });
    }
    return Response.json({ id: result.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('send-document failed', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Email send failed' }, { status: 500, headers: corsHeaders });
  }
});
