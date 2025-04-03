import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return a new frame response
    return res.status(200).json({
      frames: {
        version: 'vNext',
        image: 'https://match-maker-lemon.vercel.app/images/branding/logo-light-512.png',
        buttons: [
          {
            label: 'Play Game',
            action: 'link',
            target: 'https://match-maker-lemon.vercel.app'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error handling frame:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 