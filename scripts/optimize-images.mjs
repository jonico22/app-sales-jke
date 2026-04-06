import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import path from 'path';
import fs from 'fs';

const IMAGES_PATH = 'src/assets';

/**
 * Script to atomatically optimize and convert images to WebP
 * Using imagemin for better compression while maintaining quality.
 */
async function optimizeImages() {
  console.log('🚀 Starting image optimization and WebP conversion...');
  
  try {
    const files = await imagemin([`${IMAGES_PATH}/*.{jpg,png}`], {
      destination: IMAGES_PATH,
      plugins: [
        imageminWebp({ 
           quality: 85, // Balance between size and quality
           lossless: false 
        })
      ]
    });

    console.log(`✅ Success! Optimized ${files.length} images.`);
    files.forEach(file => {
      const originalExt = path.extname(file.sourcePath);
      const originalName = path.basename(file.sourcePath, originalExt);
      console.log(` - Converted: ${originalName}${originalExt} -> ${originalName}.webp`);
    });
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

optimizeImages();
