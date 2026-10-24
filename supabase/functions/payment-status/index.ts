import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { transactionId } = await request.json();
    if (typeof transactionId !== 'string' || transactionId.length < 8 || transactionId.length > 128) {
      return Response.json({ error: 'Invalid transaction reference' }, { status: 400, headers: cors });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await supabase.from('payments').select('status,mpesa_receipt_number').eq('transaction_id', transactionId).maybeSingle();
    if (error) throw error;
    return Response.json({ status: data?.status || 'pending', receipt: data?.mpesa_receipt_number || null }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('payment-status failed', error);
    return Response.json({ error: 'Could not check payment status' }, { status: 500, headers: cors });
  }
});
