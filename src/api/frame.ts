import { createCanvas } from 'canvas';
import { FRAME_CONFIG } from '../config/frame';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const score = url.searchParams.get('score') || '0';
  const mode = url.searchParams.get('mode') || 'Classic Mode';

  // Create canvas with configured dimensions
  const canvas = createCanvas(
    FRAME_CONFIG.dimensions.width,
    FRAME_CONFIG.dimensions.height
  );
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = FRAME_CONFIG.style.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `${FRAME_CONFIG.style.accentColor}33`);  // 20% opacity
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configure text
  ctx.fillStyle = FRAME_CONFIG.style.textColor;
  ctx.textAlign = 'center';
  ctx.font = `72px "${FRAME_CONFIG.style.font}"`;
  
  // Draw game title
  ctx.fillText(FRAME_CONFIG.content.title, canvas.width / 2, 150);

  // Draw score
  ctx.font = `48px "${FRAME_CONFIG.style.font}"`;
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 300);

  // Draw game mode
  ctx.font = `36px "${FRAME_CONFIG.style.font}"`;
  ctx.fillText(`Mode: ${mode}`, canvas.width / 2, 400);

  // Draw call to action
  ctx.font = `32px "${FRAME_CONFIG.style.font}"`;
  ctx.fillText(FRAME_CONFIG.content.callToAction, canvas.width / 2, 500);

  // Convert canvas to buffer and send as PNG
  const buffer = canvas.toBuffer('image/png');
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=10',
    },
  });
} 