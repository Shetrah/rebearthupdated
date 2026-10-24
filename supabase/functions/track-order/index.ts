import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });
const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);

  try {
    const { reference: rawReference, contact: rawContact } = await request.json();
    const reference = typeof rawReference === 'string' ? rawReference.trim().toUpperCase() : '';
    const contact = typeof rawContact === 'string' ? rawContact.trim() : '';
    if (reference.length < 4 || reference.length > 80 || contact.length < 5 || contact.length > 200) {
      return json({ error: 'Enter a valid order or invoice number and the email address or phone used at checkout.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) throw new Error('Order tracking is not configured.');
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: orderByNumber, error: orderLookupError } = await admin
      .from('orders')
      .select('id,order_number,invoice_id,customer_name,customer_email,customer_phone,items,total_amount,status,payment_status,payment_method,source,created_at,tracking_number,delivery_note')
      .eq('order_number', reference)
      .maybeSingle();
    if (orderLookupError) throw orderLookupError;

    const { data: invoice, error: invoiceLookupError } = await admin
      .from('invoices')
      .select('id,invoice_number,customer_email,customer_phone,status,total_amount,items,created_at')
      .eq('invoice_number', reference)
      .maybeSingle();
    if (invoiceLookupError) throw invoiceLookupError;

    let order = orderByNumber;
    let matchedInvoice = invoice;
    if (order && matchedInvoice && order.invoice_id && order.invoice_id !== matchedInvoice.id) matchedInvoice = null;
    if (order && matchedInvoice && !order.invoice_id && order.order_number !== matchedInvoice.invoice_number) matchedInvoice = null;
    if (!order && matchedInvoice) {
      const { data, error } = await admin
        .from('orders')
        .select('id,order_number,invoice_id,customer_name,customer_email,customer_phone,items,total_amount,status,payment_status,payment_method,source,created_at,tracking_number,delivery_note')
        .eq('invoice_id', matchedInvoice.id)
        .maybeSingle();
      if (error) throw error;
      order = data;
    }
    if (order && !matchedInvoice && order.invoice_id) {
      const { data, error } = await admin.from('invoices')
        .select('id,invoice_number,customer_email,customer_phone,status,total_amount,items,created_at')
        .eq('id', order.invoice_id)
        .maybeSingle();
      if (error) throw error;
      if (data) matchedInvoice = data;
    }

    const invoiceRecord = matchedInvoice || null;
    const record = order || (matchedInvoice ? {
      order_number: matchedInvoice.invoice_number,
      customer_email: matchedInvoice.customer_email,
      customer_phone: matchedInvoice.customer_phone,
      items: matchedInvoice.items,
      total_amount: matchedInvoice.total_amount,
      status: matchedInvoice.status,
      payment_status: matchedInvoice.status,
      payment_method: null,
      source: 'website',
      created_at: matchedInvoice.created_at,
      tracking_number: null,
      delivery_note: null,
    } : null);

    if (!record) return json({ error: 'We could not find an order with those details. Check the reference and contact information, then try again.' }, 404);

    const emailCandidates = [record.customer_email, invoiceRecord?.customer_email].filter((value): value is string => typeof value === 'string' && !!value);
    const phoneCandidates = [record.customer_phone, invoiceRecord?.customer_phone].filter((value): value is string => typeof value === 'string' && !!value);
    const contactEmail = contact.includes('@') ? contact.toLowerCase() : '';
    const contactPhone = normalizePhone(contact);
    const verified = (contactEmail && emailCandidates.some(email => email.trim().toLowerCase() === contactEmail)) ||
      (contactPhone.length >= 9 && phoneCandidates.some(phone => normalizePhone(phone) === contactPhone));
    if (!verified) return json({ error: 'We could not find an order with those details. Check the reference and contact information, then try again.' }, 404);

    return json({ order: {
      order_number: record.order_number || invoiceRecord?.invoice_number || reference,
      invoice_number: invoiceRecord?.invoice_number || null,
      created_at: record.created_at,
      total_amount: Number(record.total_amount || invoiceRecord?.total_amount || 0),
      status: record.status || 'pending',
      payment_status: record.payment_status || invoiceRecord?.status || 'pending',
      payment_method: record.payment_method || null,
      source: record.source || 'website',
      items: Array.isArray(record.items) ? record.items : [],
      tracking_number: record.tracking_number || null,
      delivery_note: record.delivery_note || null,
    } });
  } catch (error) {
    console.error('track-order failed:', error);
    return json({ error: 'Order tracking is temporarily unavailable. Please try again shortly.' }, 500);
  }
});
