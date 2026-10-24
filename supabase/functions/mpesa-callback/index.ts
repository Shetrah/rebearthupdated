// If running in Node.js, use Express instead of Deno's serve
import express from 'express'
import bodyParser from 'body-parser'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const app = express();
app.options('*', (req, res) => {
  res.set(corsHeaders);
  res.send('ok');
});

app.post('/', async (req, res) => {
  try {
    // Service role is required because Safaricom callbacks have no customer JWT.
    const supabaseClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const callbackData = req.body;
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData.Body?.stkCallback;
    if (!stkCallback) {
      throw new Error('Invalid callback data structure');
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Update payment status based on result code
    const status = ResultCode === 0 ? 'completed' : 'failed';

    let mpesaReceiptNumber = null;
    if (CallbackMetadata && CallbackMetadata.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      mpesaReceiptNumber = receiptItem?.Value || null;
    }

    // Update payment record
    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status,
        mpesa_receipt_number: mpesaReceiptNumber,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', CheckoutRequestID)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    // If payment is successful, update invoice status
    if (status === 'completed' && payment) {
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.invoice_id)
        .select('id, invoice_number')
        .single();

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
      } else if (invoice) {
        const { error: orderError } = await supabaseClient
          .from('orders')
          .update({ payment_status: 'paid', status: 'paid', updated_at: new Date().toISOString() })
          .eq('invoice_id', invoice.id);
        if (orderError) console.error('Error updating linked order:', orderError);
      }
    }

    console.log('Payment updated successfully:', payment);

    res.set({ ...corsHeaders, 'Content-Type': 'application/json' });
    res.status(200).json({
      ResultCode: '0',
      ResultDesc: 'Accepted'
    });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.set({ ...corsHeaders, 'Content-Type': 'application/json' });
    res.status(200).json({
      ResultCode: 'C2B00011',
      ResultDesc: 'Rejected'
    });
  }
});
