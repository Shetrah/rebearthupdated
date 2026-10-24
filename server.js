import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
dotenv.config();

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create express app first
const app = express();

// ✅ Now you can use it
app.post('/simulate-c2b', async (req, res) => {
  const token = await getToken();

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate',
      {
        ShortCode: 247247,
        CommandID: 'CustomerPayBillOnline',
        Amount: 1,
        Msisdn: '254708374149',
        BillRefNumber: '169776'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('C2B Simulation Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'C2B Simulation failed' });
  }
});


// STK Push endpoint
app.post('/stkpush', async (req, res) => {
  const { phone, amount } = req.body;
  const token = await getToken();

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'Ref001',
        TransactionDesc: 'Payment',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'STK Push failed' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
