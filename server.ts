import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createCanvas } from 'canvas';
import { FRAME_CONFIG } from './src/config/frame.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Frame image generation endpoint
app.get('/api/frame', async (req, res) => {
  try {
    const { score = '0', mode = 'Classic Mode' } = req.query;

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
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating frame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Frame action handling endpoint
app.post('/api/frame-action', async (req, res) => {
  try {
    const { buttonIndex = 0 } = req.body;

    // Redirect to the game with the appropriate mode
    const redirectUrl = new URL('/play', FRAME_CONFIG.baseUrl);
    redirectUrl.searchParams.set('mode', buttonIndex === 0 ? 'classic' : 'speed');

    return res.status(200).json({
      redirectUrl: redirectUrl.toString()
    });
  } catch (error) {
    console.error('Error processing frame action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 