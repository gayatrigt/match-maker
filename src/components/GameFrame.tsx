import { getFrameMetadata } from '@farcaster/core';
import { useEffect } from 'react';
import { FRAME_CONFIG } from '../config/frame';

interface GameFrameProps {
  score: number;
  gameMode: string;
  isGameOver: boolean;
}

export default function GameFrame({ score, gameMode, isGameOver }: GameFrameProps) {
  useEffect(() => {
    // Only update frame metadata when game is over
    if (isGameOver) {
      const { image, ...restMetadata } = FRAME_CONFIG.metadata;
      
      const metadata = getFrameMetadata({
        buttons: [
          {
            label: 'Play Crypto Match',
            action: 'post'
          }
        ],
        image: {
          src: `${FRAME_CONFIG.baseUrl}/api/frame?score=${score}&mode=${encodeURIComponent(gameMode)}`,
          aspectRatio: image.aspectRatio
        },
        postUrl: `${FRAME_CONFIG.baseUrl}/api/frame-action`,
        ...restMetadata,
      });

      // Update frame metadata in document head
      const metaTags = document.head.querySelectorAll('meta[property^="fc:"]');
      metaTags.forEach(tag => tag.remove());
      document.head.insertAdjacentHTML('beforeend', metadata);
    }
  }, [isGameOver, score, gameMode]);

  return null; // This is a utility component that doesn't render anything
} 