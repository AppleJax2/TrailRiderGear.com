#!/usr/bin/env node
// build-product-library.mjs
// Fetches real Amazon product data via Axesso RapidAPI and builds
// a product library JSON that maps directly to AmazonProductCard props.
//
// Budget: 20 API calls (Axesso free tier = 20/day)
// Output: scripts/product-library.json
//
// Usage: node scripts/build-product-library.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ENV_PATH = '.env';
const OUTPUT_PATH = 'scripts/product-library.json';
const API_HOST = 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com';
const SLEEP_MS = 3500; // 3.5s between calls — conservative to avoid 429s

// Read API key from .env
const envRaw = readFileSync(ENV_PATH, 'utf8');
const keyMatch = envRaw.match(/RAPIDAPI_KEY=(.+)/);
if (!keyMatch) { console.error('ERROR: No RAPIDAPI_KEY in .env'); process.exit(1); }
const API_KEY = keyMatch[1].trim();

// Read affiliate tag
const tagMatch = envRaw.match(/AMAZON_PARTNER_TAG=(.+)/);
const AFFILIATE_TAG = tagMatch ? tagMatch[1].trim() : 'trailridergea-20';

// ---------------------------------------------------------------------------
// The 20 ASINs we're fetching — every call counts
// ---------------------------------------------------------------------------
const ASINS = [
  // === E-BIKES (12) — for new "Best Hunting/Off-Road E-Bikes" posts ===
  { asin: 'B0C6B7KVPB', id: 'quietkat-apex-10',     category: 'hunting-ebike',      expectedBrand: 'QuietKat',  targetPosts: ['best-hunting-ebikes-2026'] },
  { asin: 'B07SJR52BW', id: 'quietkat-apex-2019',    category: 'hunting-ebike',      expectedBrand: 'QuietKat',  targetPosts: ['best-hunting-ebikes-2026'] },
  { asin: 'B0F3JQ4212', id: 'philodo-falcon-hunting', category: 'hunting-ebike',     expectedBrand: 'PHILODO',   targetPosts: ['best-hunting-ebikes-2026'] },
  { asin: 'B0D14PGK6D', id: 'himiway-cobra-pro',    category: 'offroad-ebike',      expectedBrand: 'Himiway',   targetPosts: ['best-offroad-ebikes-2026', 'best-highperformance-ebikes'] },
  { asin: 'B0BSLHJKK6', id: 'himiway-zebra',        category: 'offroad-ebike',      expectedBrand: 'Himiway',   targetPosts: ['best-offroad-ebikes-2026'] },
  { asin: 'B0C4PFWX6X', id: 'engwe-m20',            category: 'offroad-ebike',      expectedBrand: 'ENGWE',     targetPosts: ['best-offroad-ebikes-2026', 'best-budget-offroad-ebikes'] },
  { asin: 'B09L63HGDP', id: 'jasion-eb5',           category: 'budget-ebike',       expectedBrand: 'Jasion',    targetPosts: ['best-budget-offroad-ebikes'] },
  { asin: 'B0G93185VQ', id: 'funhang-fattire',      category: 'offroad-ebike',      expectedBrand: 'Funhang',   targetPosts: ['best-budget-offroad-ebikes'] },
  { asin: 'B0FG74R72R', id: 'gokeep-1300w',         category: 'offroad-ebike',      expectedBrand: 'GOKEEP',    targetPosts: ['best-budget-offroad-ebikes'] },
  { asin: 'B0CG96T4MC', id: 'gotrax-dolphin',       category: 'commuter-ebike',     expectedBrand: 'Gotrax',    targetPosts: ['must-have-ebike-accessories'] },
  { asin: 'B0FDW4TT5V', id: 'dualmotor-6000w',     category: 'highperf-ebike',     expectedBrand: 'Unknown',   targetPosts: ['best-highperformance-ebikes'] },
  { asin: 'B0FG83PXL4', id: 'ecoe-dualmotor',      category: 'highperf-ebike',     expectedBrand: 'EcoE',      targetPosts: ['best-highperformance-ebikes'] },

  // === ACCESSORIES (8) — unverified ASINs for upcoming posts ===
  { asin: 'B0043MLLI6', id: 'planet-koko-rack',     category: 'cargo-rack',         expectedBrand: 'Planet Bike', targetPosts: ['ebike-cargo-trailers-racks-guide'] },
  { asin: 'B00S2QYNI4', id: 'axiom-streamliner',   category: 'cargo-rack',         expectedBrand: 'Axiom',       targetPosts: ['ebike-cargo-trailers-racks-guide'] },
  { asin: 'B09RQ479DL', id: 'ortlieb-bikepacker',   category: 'pannier-bag',        expectedBrand: 'Ortlieb',     targetPosts: ['ebike-waterproof-panniers-guide'] },
  { asin: 'B00NTAB502', id: 'blackburn-local',      category: 'pannier-bag',        expectedBrand: 'Blackburn',   targetPosts: ['ebike-waterproof-panniers-guide'] },
  { asin: 'B09M7WM6Z9', id: 'brooks-handlebar-roll', category: 'handlebar-bag',    expectedBrand: 'Brooks England', targetPosts: ['best-ebike-handlebar-bags'] },
  { asin: 'B00J43XG3W', id: 'revelate-feedbag',     category: 'handlebar-bag',      expectedBrand: 'Revelate Designs', targetPosts: ['best-ebike-handlebar-bags'] },
  { asin: 'B0868WD176', id: 'rambo-hauler',         category: 'bike-rack',          expectedBrand: 'Rambo Bikes',  targetPosts: ['best-ebike-trailer-hitches'] },
  { asin: 'B0187ZRKQ6', id: 'topeak-mtx-exp',      category: 'cargo-bag',          expectedBrand: 'Topeak',       targetPosts: ['best-ebike-handlebar-bags'] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function cleanBrand(raw) {
  if (!raw) return '';
  return raw
    .replace(/^Brand:\s*/i, '')
    .replace(/^Visit the\s*/i, '')
    .replace(/\s*Store$/i, '')
    .trim();
}

function parseRating(raw) {
  if (!raw) return 0;
  const m = raw.match(/(\d\.?\d?)\s*out of/);
  return m ? parseFloat(m[1]) : 0;
}

function formatPrice(price, retailPrice) {
  const p = price > 0 ? price : (retailPrice > 0 ? retailPrice : 0);
  return p > 0 ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : 'Check Amazon for price';
}

function shortenTitle(fullTitle, expectedBrand) {
  // Strip brand prefix and common Amazon filler to create a clean product name
  let name = fullTitle || '';
  // Remove brand name from start
  if (expectedBrand) {
    const brandRegex = new RegExp(`^${expectedBrand}\\s*`, 'i');
    name = name.replace(brandRegex, '');
  }
  // Remove common Amazon title filler patterns
  name = name
    .replace(/\s*-\s*$/, '')
    .replace(/\s*,\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Truncate to something reasonable for a card heading (first meaningful chunk)
  if (name.length > 80) {
    // Try to cut at a comma or dash
    const cut = name.substring(0, 80).lastIndexOf(',');
    if (cut > 30) name = name.substring(0, cut);
    else name = name.substring(0, 80) + '…';
  }
  return name;
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------
async function fetchProduct(asin) {
  const amazonUrl = `https://www.amazon.com/dp/${asin}`;
  const url = new URL(`https://${API_HOST}/amz/amazon-lookup-product`);
  url.searchParams.append('url', amazonUrl);
  url.searchParams.append('domainCode', 'com');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST,
    }
  });

  if (res.status === 429) {
    console.error(`  ⛔ RATE LIMITED (429) — stopping to preserve remaining credits`);
    return { error: 'RATE_LIMITED', status: 429 };
  }

  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status}`);
    return { error: 'HTTP_ERROR', status: res.status };
  }

  const data = await res.json();

  if (!data || data.responseStatus !== 'PRODUCT_FOUND_RESPONSE') {
    console.error(`  ✗ Product not found (responseStatus: ${data?.responseStatus})`);
    return { error: 'NOT_FOUND', status: 200 };
  }

  return { data };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60));
  console.log('EBikeFieldGuide.com — Product Library Builder');
  console.log(`Budget: ${ASINS.length} API calls | Key: ...${API_KEY.slice(-8)}`);
  console.log('='.repeat(60));

  // Load existing library if present (to preserve previously fetched data)
  let library = { lastUpdated: '', products: [] };
  if (existsSync(OUTPUT_PATH)) {
    try {
      library = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
      console.log(`Loaded existing library with ${library.products.length} products`);
    } catch { /* start fresh */ }
  }

  const results = { success: 0, failed: 0, rateLimited: false };

  for (let i = 0; i < ASINS.length; i++) {
    const entry = ASINS[i];
    const callNum = i + 1;
    console.log(`\n[${callNum}/${ASINS.length}] ${entry.id} (${entry.asin})...`);

    const { data, error, status } = await fetchProduct(entry.asin);

    if (error === 'RATE_LIMITED') {
      results.rateLimited = true;
      console.log(`\n⛔ Rate limited after ${results.success} successful calls.`);
      console.log('Saving what we have so far...');
      break;
    }

    if (error) {
      results.failed++;
      // Still add to library as a placeholder
      const existingIdx = library.products.findIndex(p => p.asin === entry.asin);
      if (existingIdx === -1) {
        library.products.push({
          asin: entry.asin,
          id: entry.id,
          category: entry.category,
          targetPosts: entry.targetPosts,
          status: 'FETCH_FAILED',
          fetchedAt: new Date().toISOString(),
          // Placeholder props for AmazonProductCard
          name: `${entry.expectedBrand} (fetch failed — update manually)`,
          brand: entry.expectedBrand,
          price: 'Check Amazon for price',
          rating: 0,
          reviewCount: 0,
          image: null,
          features: [],
          amazonUrl: `https://www.amazon.com/dp/${entry.asin}?tag=${AFFILIATE_TAG}`,
        });
      }
      continue;
    }

    // === Transform API response → AmazonProductCard-ready format ===
    const brand = cleanBrand(data.manufacturer) || entry.expectedBrand;
    const product = {
      // Identity
      asin: entry.asin,
      id: entry.id,
      category: entry.category,
      targetPosts: entry.targetPosts,
      status: 'VERIFIED',
      fetchedAt: new Date().toISOString(),

      // === AmazonProductCard props (ready to copy into MDX) ===
      name: shortenTitle(data.productTitle, brand),
      brand,
      price: formatPrice(data.price, data.retailPrice),
      rating: parseRating(data.productRating),
      reviewCount: data.countReview || 0,
      image: data.mainImage?.imageUrl || null,
      features: (data.features || []).slice(0, 5),
      amazonUrl: `https://www.amazon.com/dp/${entry.asin}?tag=${AFFILIATE_TAG}`,

      // Editorial fields — populated when writing blog posts
      pros: [],
      cons: [],

      // Extra API data for reference when writing
      _fullTitle: data.productTitle || '',
      _allImages: (data.imageUrlList || []).slice(0, 5),
      _availability: data.warehouseAvailability || '',
      _allFeatures: data.features || [],
    };

    // Upsert into library
    const existingIdx = library.products.findIndex(p => p.asin === entry.asin);
    if (existingIdx >= 0) {
      library.products[existingIdx] = product;
    } else {
      library.products.push(product);
    }

    results.success++;
    console.log(`  ✓ ${brand} — ${product.name.substring(0, 55)}`);
    console.log(`    ${product.price} | ${product.rating}★ (${product.reviewCount} reviews)`);
    console.log(`    Image: ${product.image ? '✓' : '✗'} | Features: ${product.features.length}`);

    // Save after EVERY successful call (no data loss if something fails)
    library.lastUpdated = new Date().toISOString();
    writeFileSync(OUTPUT_PATH, JSON.stringify(library, null, 2));

    // Sleep before next call (skip sleep on last call)
    if (i < ASINS.length - 1) {
      process.stdout.write(`    Waiting ${SLEEP_MS / 1000}s...`);
      await sleep(SLEEP_MS);
      process.stdout.write(' done\n');
    }
  }

  // === Final summary ===
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`✓ Success:      ${results.success}`);
  console.log(`✗ Failed:       ${results.failed}`);
  console.log(`⛔ Rate limited: ${results.rateLimited ? 'YES' : 'No'}`);
  console.log(`📦 Total in library: ${library.products.length}`);
  console.log(`💾 Saved to: ${OUTPUT_PATH}`);

  // Summary table
  console.log('\nProduct Library Contents:');
  console.log('-'.repeat(90));
  console.log('ASIN        | Status   | Brand            | Price     | Rating | Category');
  console.log('-'.repeat(90));
  for (const p of library.products) {
    const status = p.status === 'VERIFIED' ? '✓ OK   ' : '✗ FAIL ';
    console.log(
      `${p.asin} | ${status} | ${(p.brand || '').padEnd(16).substring(0, 16)} | ${(p.price || '').padEnd(9).substring(0, 9)} | ${p.rating ? p.rating.toFixed(1) + '★' : 'N/A  '} | ${p.category}`
    );
  }
  console.log('-'.repeat(90));

  if (results.rateLimited) {
    console.log('\n⚠️  Rate limited — run again tomorrow with remaining ASINs.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
