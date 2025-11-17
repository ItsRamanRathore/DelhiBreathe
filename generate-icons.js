import sharp from 'sharp';
import { readFileSync } from 'fs';

async function generateIcons() {
    try {
        const logoPath = './public/logo.webp';
        
        // Generate 192x192 icon
        await sharp(logoPath)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile('./public/icon-192.png');
        
        console.log('Generated icon-192.png');
        
        // Generate 512x512 icon
        await sharp(logoPath)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile('./public/icon-512.png');
        
        console.log('Generated icon-512.png');
        
        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
