export const FRAME_CONFIG = {
  // Base URL for the application
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173',
  
  // Frame dimensions
  dimensions: {
    width: 1200,
    height: 630,
  },
  
  // Frame styling
  style: {
    background: '#1a1a1a',
    accentColor: '#FF8B8B',
    textColor: '#ffffff',
    font: 'Press Start 2P',
  },
  
  // Frame content
  content: {
    title: 'CRYPTO MATCH',
    callToAction: 'Play Now & Beat This Score!',
  },
  
  // Frame metadata
  metadata: {
    name: 'Crypto Match',
    description: 'Test your crypto knowledge with this fun matching game!',
    image: {
      aspectRatio: '1.91:1',
    },
  },
}; 