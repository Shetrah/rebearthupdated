import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.rebearthsolutions.co.ke',
      port: 465,
      secure: true,
      auth: {
        user: 'info@rebearthsolutions.co.ke',
        pass: 'Rebearth2025',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"Rebearth Assistant" <info@rebearthsolutions.co.ke>`,
      to,
      subject,
      text
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ EMAIL ERROR:', error.message || error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
