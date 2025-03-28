import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'frame-image.svg');
const pngPath = path.join(process.cwd(), 'public', 'frame-image.png');

async function convertSvgToPng() {
    try {
        const svgBuffer = fs.readFileSync(svgPath);
        await sharp(svgBuffer)
            .resize(1200, 800, {
                fit: 'contain',
                background: { r: 26, g: 26, b: 26, alpha: 1 }
            })
            .png()
            .toFile(pngPath);
        console.log('Successfully converted SVG to PNG');
    } catch (error) {
        console.error('Error converting SVG to PNG:', error);
        process.exit(1);
    }
}

convertSvgToPng(); 