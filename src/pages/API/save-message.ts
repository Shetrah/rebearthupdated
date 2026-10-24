import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, isBot, timestamp } = req.body;

  try {
    const message = await prisma.message.create({
      data: { text, isBot, timestamp: new Date(timestamp) }
    });
    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save message' });
  }
}
