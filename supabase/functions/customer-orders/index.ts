import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return Response.json({ error: 'POST required' }, { status: 405, headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = request.headers.get('Authorization');
    if (!supabaseUrl || !anonKey || !serviceKey || !authorization) {
      return Response.json({ error: 'Sign in to view order history' }, { status: 401, headers: cors });
    }

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    const user = authData.user;
    if (authError || !user) return Response.json({ error: 'Your session has expired. Sign in again.' }, { status: 401, headers: cors });

    const admin = createClient(supabaseUrl, serviceKey);
    const fields = 'id,order_number,created_at,total_amount,status,payment_status,payment_method,items,customer_address,customer_email,source,user_id';
    const { data: ownedOrders, error: ownedError } = await admin
      .from('orders')
      .select(fields)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (ownedError) throw ownedError;

    let guestOrders: any[] = [];
    const email = user.email_confirmed_at || user.confirmed_at ? user.email?.trim() : null;
    if (email) {
      // Escape SQL LIKE wildcards so a verified address can match only itself.
      const emailPattern = email.toLowerCase().replace(/[\\%_]/g, '\\$&');
      const { data, error } = await admin
        .from('orders')
        .select(fields)
        .is('user_id', null)
        .eq('source', 'website')
        .ilike('customer_email', emailPattern)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      guestOrders = data || [];
    }

    const byId = new Map<string, any>();
    for (const order of [...(ownedOrders || []), ...guestOrders]) byId.set(order.id, order);
    const orders = [...byId.values()].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return Response.json({ orders }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('customer-orders failed:', error);
    return Response.json({ error: 'Could not load your orders. Please try again.' }, { status: 500, headers: cors });
  }
});
