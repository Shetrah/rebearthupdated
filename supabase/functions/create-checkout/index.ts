import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const service = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const authorization = request.headers.get('Authorization');
    let user: any = null;
    if (authorization) {
      const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
      const { data } = await authClient.auth.getUser();
      user = data.user;
    }

    const { invoice: suppliedInvoice, orderNumber, guestToken } = await request.json();
    if (!suppliedInvoice || typeof orderNumber !== 'string' || typeof guestToken !== 'string' || guestToken.length < 32 || !Array.isArray(suppliedInvoice.items) || !suppliedInvoice.items.length) {
      return Response.json({ error: 'Checkout details are incomplete. Please return to checkout and try again.' }, { status: 400, headers: cors });
    }
    const email = String(suppliedInvoice.customerEmail || '').trim().toLowerCase();
    if (!email.includes('@')) return Response.json({ error: 'Enter a valid email address for your invoice.' }, { status: 400, headers: cors });

    const names = suppliedInvoice.items.map((item: any) => String(item.name || '').trim());
    const { data: products, error: productsError } = await service.from('products').select('name,price,image_url,active').in('name', names);
    if (productsError) throw productsError;
    const catalog = new Map((products || []).map((product: any) => [product.name.trim().toLowerCase(), product]));
    let total = 0;
    const invoiceItems = [];
    const orderItems = [];
    for (const item of suppliedInvoice.items) {
      const product = catalog.get(String(item.name || '').trim().toLowerCase());
      const quantity = Number(item.quantity);
      if (!product || product.active === false || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return Response.json({ error: `Product unavailable or invalid quantity: ${item.name}` }, { status: 400, headers: cors });
      }
      const price = Number(product.price);
      total += price * quantity;
      invoiceItems.push({ name: product.name, quantity, price, total: price * quantity });
      orderItems.push({ name: product.name, quantity, price, image_url: product.image_url || '' });
    }
    if (Math.abs(total - Number(suppliedInvoice.totalAmount)) > 0.01) return Response.json({ error: 'The cart total changed. Refresh the cart and try again.' }, { status: 409, headers: cors });

    const invoiceNumber = String(suppliedInvoice.invoiceNumber || '');
    const { data: existingInvoice, error: existingInvoiceError } = await service.from('invoices').select('*').eq('invoice_number', invoiceNumber).maybeSingle();
    if (existingInvoiceError) throw existingInvoiceError;
    let invoice = existingInvoice;
    if (invoice && invoice.guest_token !== guestToken && (!user || invoice.user_id !== user.id)) {
      return Response.json({ error: 'This invoice reference is already in use. Start checkout again.' }, { status: 409, headers: cors });
    }
    if (!invoice) {
      const { data, error } = await service.from('invoices').insert({
        invoice_number: invoiceNumber, customer_name: suppliedInvoice.customerName, customer_email: suppliedInvoice.customerEmail,
        customer_phone: suppliedInvoice.customerPhone, customer_address: suppliedInvoice.customerAddress,
        items: invoiceItems, total_amount: total, status: 'pending', user_id: user?.id ?? null, guest_token: guestToken,
      }).select().single();
      if (error) throw error;
      invoice = data;
    }

    const { data: existingOrder, error: existingOrderError } = await service.from('orders').select('id,guest_token,user_id,invoice_id').eq('order_number', orderNumber).maybeSingle();
    if (existingOrderError) throw existingOrderError;
    if (existingOrder && existingOrder.guest_token !== guestToken && (!user || existingOrder.user_id !== user.id)) {
      return Response.json({ error: 'This order reference is already in use.' }, { status: 409, headers: cors });
    }
    if (!existingOrder) {
      const { error } = await service.from('orders').insert({
        order_number: orderNumber, invoice_id: invoice.id, user_id: user?.id ?? null, guest_token: guestToken,
        customer_name: suppliedInvoice.customerName, customer_email: suppliedInvoice.customerEmail,
        customer_phone: suppliedInvoice.customerPhone, customer_address: suppliedInvoice.customerAddress,
        items: orderItems, total_amount: total, status: 'pending', payment_status: 'pending', payment_method: 'M-Pesa', source: 'website',
      });
      if (error) throw error;
    } else if (!existingOrder.invoice_id) {
      const { error } = await service.from('orders').update({ invoice_id: invoice.id }).eq('id', existingOrder.id);
      if (error) throw error;
    }
    return Response.json({ invoice, orderNumber, totalAmount: total }, { headers: cors });
  } catch (error) {
    console.error('create-checkout failed:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Could not save your order' }, { status: 500, headers: cors });
  }
});
