import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  try {
    const expectedSecret = Deno.env.get('PAYHERO_CALLBACK_SECRET');
    if (!expectedSecret || new URL(request.url).searchParams.get('secret') !== expectedSecret) {
      return Response.json({ error: 'Unauthorized callback' }, { status: 401 });
    }
    const body = await request.json();
    const payment = body.response || body;
    const transactionId = payment.CheckoutRequestID ?? payment.checkout_request_id;
    const invoiceNumber = payment.ExternalReference ?? payment.external_reference;
    if (typeof transactionId !== 'string' || typeof invoiceNumber !== 'string') return Response.json({ error: 'Invalid PayHero callback' }, { status: 400 });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: paymentRow, error: paymentLookupError } = await supabase.from('payments').select('id,invoice_id,amount,status').eq('transaction_id', transactionId).maybeSingle();
    if (paymentLookupError || !paymentRow) return Response.json({ error: 'Payment reference was not found' }, { status: 404 });
    const { data: invoice, error: invoiceLookupError } = await supabase.from('invoices').select('id,invoice_number,total_amount').eq('id', paymentRow.invoice_id).maybeSingle();
    const callbackAmount = payment.Amount ?? payment.amount;
    if (invoiceLookupError || !invoice || invoice.invoice_number !== invoiceNumber || Number(invoice.total_amount) !== Number(paymentRow.amount) || Number(callbackAmount) !== Number(paymentRow.amount)) {
      return Response.json({ error: 'Payment details do not match the invoice' }, { status: 400 });
    }

    const resultCode = payment.ResultCode ?? payment.result_code;
    const statusText = String(payment.Status ?? payment.status ?? '').toLowerCase();
    const paid = String(resultCode ?? '') === '0' || ['success', 'successful', 'paid'].includes(statusText);
    const nextStatus = paid ? 'completed' : 'failed';
    const receiptNumber = payment.MpesaReceiptNumber ?? payment.mpesa_receipt_number;
    const { error: updateError } = await supabase.from('payments').update({ status: nextStatus, mpesa_receipt_number: String(receiptNumber || ''), updated_at: new Date().toISOString() }).eq('id', paymentRow.id);
    if (updateError) throw updateError;
    if (paid) {
      const now = new Date().toISOString();
      const { error: invoiceError } = await supabase.from('invoices').update({ status: 'paid', updated_at: now }).eq('id', invoice.id);
      if (invoiceError) throw invoiceError;
      const { error: orderError } = await supabase.from('orders').update({ status: 'paid', payment_status: 'paid', updated_at: now }).eq('invoice_id', invoice.id);
      if (orderError) throw orderError;
    }
    return Response.json({ status: 'accepted' });
  } catch (error) {
    console.error('PayHero callback processing failed:', error);
    return Response.json({ error: 'Callback processing failed' }, { status: 500 });
  }
});
