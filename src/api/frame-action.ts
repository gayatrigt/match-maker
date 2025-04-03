import { Message, getFrameMessage } from '@farcaster/core';
import { FRAME_CONFIG } from '../config/frame';

export default async function handler(req: Request) {
  try {
    // Validate the frame message
    const body = await req.json();
    const message = Message.fromJson(body);
    const frameMessage = await getFrameMessage(message);

    if (!frameMessage) {
      return new Response(
        JSON.stringify({ error: 'Invalid frame message' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Redirect to the game with the appropriate mode
    const redirectUrl = new URL('/play', FRAME_CONFIG.baseUrl);
    redirectUrl.searchParams.set('mode', frameMessage.buttonIndex === 0 ? 'classic' : 'speed');

    return new Response(
      JSON.stringify({ redirectUrl: redirectUrl.toString() }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing frame action:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 