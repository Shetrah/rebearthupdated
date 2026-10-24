import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization');
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    let user: any = null;
    if (authorization) {
      const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
      const { data, error: authError } = await callerClient.auth.getUser();
      if (authError || !data.user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
      user = data.user;
    }

    const { to, customerName, invoiceNumber, type, pdfBase64 } = await request.json();
    if (typeof to !== 'string' || !to.includes('@') || typeof pdfBase64 !== 'string' || pdfBase64.length > 8_000_000 || !['invoice','receipt'].includes(type)) {
      return Response.json({ error: 'Invalid document details' }, { status: 400, headers: corsHeaders });
    }
    const adminClient = createClient(url, serviceKey);
    const { data: invoice } = await adminClient.from('invoices').select('user_id,customer_email').eq('invoice_number', invoiceNumber).maybeSingle();
    if (!invoice) return Response.json({ error: 'Invoice record was not found' }, { status: 404, headers: corsHeaders });
    let isAdmin = false;
    if (user) {
      const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle();
      isAdmin = profile?.role === 'admin';
    }
    if (!isAdmin && (!user ? invoice.user_id !== null : invoice.user_id !== user.id)) {
      return Response.json({ error: 'You cannot email another customer’s invoice' }, { status: 403, headers: corsHeaders });
    }
    if (to.toLowerCase() !== String(invoice.customer_email || '').toLowerCase()) return Response.json({ error: 'Recipient does not match the invoice email' }, { status: 400, headers: corsHeaders });
    const isReceipt = type === 'receipt';
    const subject = `${isReceipt ? 'Your Rebearth payment receipt' : 'Your Rebearth invoice'} · ${invoiceNumber}`;
    const html = `<div style="font-family:Arial,sans-serif;background:#f2f7f3;padding:32px;color:#16372c"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden"><div style="background:#0c2f27;padding:28px;color:white"><div style="font-size:20px;font-weight:bold">REBEARTH SOLUTIONS</div><div style="margin-top:6px;color:#b7e8ce">Sustainable agriculture. Stronger harvests.</div></div><div style="padding:28px"><p>Hello ${String(customerName || 'Customer').replace(/[&<>"']/g, '')},</p><p>${isReceipt ? 'Thank you. Your payment is confirmed and your receipt is attached.' : 'Your invoice is ready. The PDF is attached for your records and payment reference.'}</p><p style="padding:14px;background:#eff8f2;border-radius:10px"><strong>${isReceipt ? 'Receipt' : 'Invoice'} ${invoiceNumber}</strong></p><p style="color:#60746a;font-size:13px">Questions? Reply to this email or contact info@rebearthsolutions.com.</p></div></div></div>`;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('Set the RESEND_API_KEY Supabase function secret before sending email.');
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Rebearth Solutions <receipts@rebearthsolutions.com>',
        to: [to], subject, html,
        attachments: [{ filename: `${type}_${invoiceNumber}.pdf`, content: pdfBase64 }],
      }),
    });
    const result = await resendResponse.json();
    if (!resendResponse.ok) throw new Error(result.message || 'Resend rejected the email');
    return Response.json({ id: result.id }, { headers: corsHeaders });
  } catch (error) {
    console.error('send-document failed', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Email send failed' }, { status: 500, headers: corsHeaders });
  }
});
