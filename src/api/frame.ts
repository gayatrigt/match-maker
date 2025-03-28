import { z } from 'zod';

// Define the frame request schema
const frameRequestSchema = z.object({
    untrustedData: z.object({
        buttonIndex: z.number(),
        messageHash: z.string(),
        fid: z.number(),
        url: z.string(),
        messageId: z.string(),
        network: z.number(),
        button: z.number(),
        castId: z.object({
            fid: z.number(),
            hash: z.string(),
        }),
    }),
});

export async function POST(req: Request) {
    const body = await req.json();
    
    // Validate the frame request
    const result = frameRequestSchema.safeParse(body);
    if (!result.success) {
        return new Response('Invalid frame request', { status: 400 });
    }

    const { buttonIndex } = result.data.untrustedData;

    // Handle different button actions
    switch (buttonIndex) {
        case 0: // Play Game
            return new Response(
                JSON.stringify({
                    frames: {
                        version: 'vNext',
                        image: 'https://match-maker-lemon.vercel.app/frame-image.png',
                        buttons: [
                            {
                                label: 'Play Game',
                                action: 'post'
                            },
                            {
                                label: 'Leaderboard',
                                action: 'post'
                            }
                        ],
                        post_url: 'https://match-maker-lemon.vercel.app/api/frame'
                    }
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        
        case 1: // Leaderboard
            return new Response(
                JSON.stringify({
                    frames: {
                        version: 'vNext',
                        image: 'https://match-maker-lemon.vercel.app/frame-image.png',
                        buttons: [
                            {
                                label: 'Back to Game',
                                action: 'post'
                            }
                        ],
                        post_url: 'https://match-maker-lemon.vercel.app/api/frame'
                    }
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

        default:
            return new Response('Invalid button index', { status: 400 });
    }
} 