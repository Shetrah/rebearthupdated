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
    // Replace with your actual Supabase URL and anon key
    const supabaseClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string
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
      const { error: invoiceError } = await supabaseClient
        .from('invoices')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('invoice_number', payment.invoice_id);

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
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