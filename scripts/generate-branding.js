import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = {
  favicon: [16, 32, 48],
  logo: [128, 256, 512],
};

const sourceSvg = path.join(__dirname, '../public/images/branding/logo.svg');
const outputDir = path.join(__dirname, '../public/images/branding');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate favicon sizes
async function generateFavicon() {
  const faviconSizes = sizes.favicon;
  
  // Generate PNG favicons
  await Promise.all(
    faviconSizes.map(size =>
      sharp(sourceSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `favicon-${size}.png`))
    )
  );
  
  // Copy the 32x32 version as the main favicon
  fs.copyFileSync(
    path.join(outputDir, 'favicon-32.png'),
    path.join(outputDir, 'favicon.png')
  );
  
  console.log('Generated favicon variations');
}

// Generate logo variations
async function generateLogos() {
  const logoSizes = sizes.logo;
  
  // Generate light version
  await Promise.all(
    logoSizes.map(size =>
      sharp(sourceSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `logo-light-${size}.png`))
    )
  );
  console.log('Generated light logo variations');

  // Generate dark version
  await Promise.all(
    logoSizes.map(size =>
      sharp(sourceSvg)
        .resize(size, size)
        .modulate({ brightness: 0.8 })
        .png()
        .toFile(path.join(outputDir, `logo-dark-${size}.png`))
    )
  );
  console.log('Generated dark logo variations');
}

// Run the generation
async function generateAll() {
  try {
    await generateFavicon();
    await generateLogos();
    console.log('All branding assets generated successfully!');
  } catch (error) {
    console.error('Error generating branding assets:', error);
    process.exit(1);
  }
}

generateAll(); 