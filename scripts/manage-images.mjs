#!/usr/bin/env node
/**
 * Image Management Script for EBikeFieldGuide.com
 * 
 * Manages a local image library manifest that maps to Cloudinary CDN.
 * Supports two modes:
 *   1. Fetch mode — Cloudinary proxies external URLs (Amazon images, etc.) with auto-optimization
 *   2. Upload mode — Upload local images to Cloudinary (requires API key)
 * 
 * Usage:
 *   node scripts/manage-images.mjs add --slug best-hunting-ebikes-2026 --url "https://..." --alt "Description" --category hero
 *   node scripts/manage-images.mjs list
 *   node scripts/manage-images.mjs list --slug best-hunting-ebikes-2026
 *   node scripts/manage-images.mjs upload --file public/blog-images/photo.jpg --slug best-hunting-ebikes-2026 --alt "Description"
 * 
 * Environment:
 *   PUBLIC_CLOUDINARY_CLOUD_NAME — your Cloudinary cloud name (default: ebikefieldguide)
 *   CLOUDINARY_API_KEY — required for upload mode only
 *   CLOUDINARY_API_SECRET — required for upload mode only
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIBRARY_PATH = resolve(__dirname, 'image-library.json');
const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmppi8kbu';

// Load or initialize library
function loadLibrary() {
  if (existsSync(LIBRARY_PATH)) {
    return JSON.parse(readFileSync(LIBRARY_PATH, 'utf-8'));
  }
  return {
    meta: {
      description: 'Image library for EBikeFieldGuide.com. Maps images to Cloudinary CDN.',
      cloudName: CLOUD_NAME,
      lastUpdated: new Date().toISOString().split('T')[0],
    },
    images: [],
  };
}

function saveLibrary(lib) {
  lib.meta.lastUpdated = new Date().toISOString().split('T')[0];
  writeFileSync(LIBRARY_PATH, JSON.stringify(lib, null, 2) + '\n');
  console.log(`Saved ${lib.images.length} images to ${LIBRARY_PATH}`);
}

// Build Cloudinary fetch URL
function buildFetchUrl(originalUrl, width = 800, quality = 80) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_${quality},w_${width}/${originalUrl}`;
}

// Build Cloudinary upload URL
function buildUploadUrl(publicId, width = 800, quality = 80) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${quality},w_${width}/${publicId}`;
}

// Commands
function addImage(args) {
  const lib = loadLibrary();
  const slug = args['--slug'];
  const url = args['--url'];
  const alt = args['--alt'] || '';
  const category = args['--category'] || 'content';

  if (!slug || !url) {
    console.error('Required: --slug and --url');
    process.exit(1);
  }

  const id = `${slug}/${category}-${Date.now()}`;
  const entry = {
    id,
    slug,
    category,
    originalUrl: url,
    alt,
    cloudinaryFetchUrl: buildFetchUrl(url),
    addedDate: new Date().toISOString().split('T')[0],
    type: 'fetch',
  };

  lib.images.push(entry);
  saveLibrary(lib);
  console.log(`Added image: ${id}`);
  console.log(`Cloudinary URL: ${entry.cloudinaryFetchUrl}`);
}

function listImages(args) {
  const lib = loadLibrary();
  const slug = args['--slug'];

  const filtered = slug
    ? lib.images.filter(img => img.slug === slug)
    : lib.images;

  if (filtered.length === 0) {
    console.log(slug ? `No images found for slug: ${slug}` : 'Image library is empty.');
    return;
  }

  console.log(`\nImage Library (${filtered.length} images):\n`);

  // Group by slug
  const grouped = {};
  for (const img of filtered) {
    if (!grouped[img.slug]) grouped[img.slug] = [];
    grouped[img.slug].push(img);
  }

  for (const [s, images] of Object.entries(grouped)) {
    console.log(`  ${s}/`);
    for (const img of images) {
      console.log(`    [${img.category}] ${img.alt || '(no alt)'}`);
      console.log(`      Original: ${img.originalUrl}`);
      console.log(`      CDN:      ${img.cloudinaryFetchUrl || img.cloudinaryUploadUrl}`);
    }
    console.log('');
  }
}

async function uploadImage(args) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('Upload requires CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.');
    console.error('For fetch mode (no upload needed), use: node scripts/manage-images.mjs add --url <url>');
    process.exit(1);
  }

  const filePath = args['--file'];
  const slug = args['--slug'];
  const alt = args['--alt'] || '';
  const category = args['--category'] || 'content';

  if (!filePath || !slug) {
    console.error('Required: --file and --slug');
    process.exit(1);
  }

  const fullPath = resolve(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const publicId = `ebikefieldguide/${slug}/${category}-${Date.now()}`;

  // Use Cloudinary upload API
  const timestamp = Math.floor(Date.now() / 1000);
  const { createHash } = await import('crypto');
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const formData = new FormData();
  const fileBuffer = readFileSync(fullPath);
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, filePath.split('/').pop());
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  console.log(`Uploading ${filePath} as ${publicId}...`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Upload failed: ${err}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`Uploaded: ${data.secure_url}`);

  const lib = loadLibrary();
  lib.images.push({
    id: publicId,
    slug,
    category,
    publicId,
    alt,
    cloudinaryUploadUrl: buildUploadUrl(publicId),
    originalFile: filePath,
    addedDate: new Date().toISOString().split('T')[0],
    type: 'upload',
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  });
  saveLibrary(lib);
}

// Parse CLI args
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      args[argv[i]] = argv[i + 1];
      i++;
    } else if (argv[i].startsWith('--')) {
      args[argv[i]] = true;
    }
  }
  return args;
}

// Main
const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));

switch (command) {
  case 'add':
    addImage(args);
    break;
  case 'list':
    listImages(args);
    break;
  case 'upload':
    await uploadImage(args);
    break;
  default:
    console.log(`
Image Management for EBikeFieldGuide.com

Commands:
  add      Add an external image URL (uses Cloudinary fetch/proxy)
  list     List all images or filter by --slug
  upload   Upload a local file to Cloudinary (requires API keys)

Examples:
  node scripts/manage-images.mjs add --slug best-hunting-ebikes-2026 --url "https://example.com/photo.jpg" --alt "Hunter on e-bike" --category hero
  node scripts/manage-images.mjs list --slug best-hunting-ebikes-2026
  node scripts/manage-images.mjs upload --file public/blog-images/photo.jpg --slug best-hunting-ebikes-2026 --alt "Trail photo"

Environment Variables:
  PUBLIC_CLOUDINARY_CLOUD_NAME  Cloudinary cloud name (default: ebikefieldguide)
  CLOUDINARY_API_KEY            Required for upload mode
  CLOUDINARY_API_SECRET         Required for upload mode
`);
}
