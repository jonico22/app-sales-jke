import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.production') });
dotenv.config({ path: path.join(__dirname, '../.env') }); // Fallback

// Configuration
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const DIST_DIR = path.join(__dirname, '../dist'); // We upload everything in dist

if (!BUCKET_NAME || !ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.warn('\n⚠️  R2 configuration missing. Skipping CDN upload. Please check your .env files.\n');
  process.exit(0);
}

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Recursive file reader
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

async function uploadFiles() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ El directorio ${DIST_DIR} no existe. Ejecuta 'npm run build' primero.`);
    process.exit(1);
  }

  const files = getFiles(DIST_DIR);
  console.log(`\n🚀 Iniciando subida a Cloudflare R2 (Bucket: ${BUCKET_NAME})...`);
  console.log(`Encontrados ${files.length} archivos para procesar.\n`);

  const uploadPromises = files.map(async (filePath) => {
    // Determine the path relative to the bucket root
    const key = path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const fileContent = fs.readFileSync(filePath);

    // Cache control based on file type
    let cacheControl = 'public, max-age=31536000, immutable'; // 1 year for assets
    if (key.endsWith('.html') || key === 'site.webmanifest') {
      cacheControl = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'; // No cache for entry points
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: cacheControl,
    });

    try {
      await s3Client.send(command);
      console.log(`✅ Subido: /${key} (${contentType})`);
    } catch (err) {
      console.error(`❌ Error al subir: /${key}`, err.message);
      throw err;
    }
  });

  try {
    // You can also chunk this using something like p-limit if you have thousands of files
    await Promise.all(uploadPromises);
    console.log('\n🎉 ¡Todos los archivos han sido subidos a Cloudflare R2 correctamente!\n');
  } catch (err) {
    console.error('\n⚠️ Hubo errores durante la subida a R2.\n');
    process.exit(1);
  }
}

uploadFiles();
