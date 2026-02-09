// build-csv-from-cache.mjs
// Builds product-media.csv from already-verified API data (cached JSON files)
// No API calls needed - uses data from previous verify runs

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// All 51 products with their ASINs and metadata
const PRODUCTS = [
  { id: 'ateam-universal', asin: 'B07Z5GB3L7', category: 'Fishing Rod Holder', brand: 'AteamProducts', displayName: 'Universal Strap Holder', productUrl: 'https://www.amazon.com/dp/B07Z5GB3L7' },
  { id: 'lectric-handlebar', asin: null, category: 'Fishing Rod Holder', brand: 'Lectric eBikes', displayName: 'Handlebar Rod Holder', productUrl: 'https://lectricebikes.com/products/fishing-rod-holder' },
  { id: 'bakcou-catch-release', asin: null, category: 'Fishing Rod Holder', brand: 'BAKCOU', displayName: 'Catch & Release Single Rod', productUrl: 'https://bakcou.com/products/ebike-bicycle-fishing-rod-holder' },
  { id: 'burley-flatbed', asin: 'B00K4VLBRQ', category: 'Cargo Trailer', brand: 'Burley', displayName: 'Flatbed Cargo Trailer', productUrl: 'https://www.amazon.com/dp/B00K4VLBRQ' },
  { id: 'burley-nomad', asin: 'B0BW26F72R', category: 'Cargo Trailer', brand: 'Burley', displayName: 'Nomad Cargo Trailer', productUrl: 'https://www.amazon.com/dp/B0BW26F72R' },
  { id: 'aventon-hitch-trailer', asin: null, category: 'Cargo Trailer', brand: 'Aventon/Burley', displayName: 'Compatible Hitch Trailer', productUrl: 'https://www.aventon.com/products/accessories' },
  { id: 'topeak-explorer', asin: 'B009XMO9BM', category: 'Cargo Rack', brand: 'Topeak', displayName: 'Explorer Rear Rack', productUrl: 'https://www.amazon.com/dp/B009XMO9BM' },
  { id: 'thule-tour-rack', asin: 'B0B6132N63', category: 'Cargo Rack', brand: 'Thule', displayName: "Pack 'n Pedal Tour Rack", productUrl: 'https://www.amazon.com/dp/B0B6132N63' },
  { id: 'planet-eco-rack', asin: 'B000SPMU9Q', category: 'Cargo Rack', brand: 'Planet Bike', displayName: 'Eco Rear Rack', productUrl: 'https://www.amazon.com/dp/B000SPMU9Q' },
  { id: 'planet-koko', asin: 'B0043MLLI6', category: 'Cargo Rack', brand: 'Planet Bike', displayName: 'K.O.K.O Rack', productUrl: 'https://www.amazon.com/dp/B0043MLLI6' },
  { id: 'axiom-streamliner', asin: 'B00S2QYNI4', category: 'Cargo Rack', brand: 'Axiom', displayName: 'Streamliner Disc DLX Rack', productUrl: 'https://www.amazon.com/dp/B00S2QYNI4' },
  { id: 'axiom-transit', asin: 'B001GSQUU4', category: 'Cargo Rack', brand: 'Axiom', displayName: 'Transit Rack', productUrl: 'https://www.amazon.com/dp/B001GSQUU4' },
  { id: 'blackburn-expedition', asin: 'B00XPRMVAW', category: 'Cargo Rack', brand: 'Blackburn', displayName: 'Expedition 1 Disc Rack', productUrl: 'https://www.amazon.com/dp/B00XPRMVAW' },
  { id: 'blackburn-outpost', asin: 'B00SO89X76', category: 'Cargo Rack', brand: 'Blackburn', displayName: 'Outpost Fat Bike Rack', productUrl: 'https://www.amazon.com/dp/B00SO89X76' },
  { id: 'aventon-rear-rack', asin: null, category: 'Cargo Rack', brand: 'Aventon', displayName: 'Rear Cargo Rack', productUrl: 'https://www.aventon.com/products/rear-rack' },
  { id: 'rad-rear-rack', asin: null, category: 'Cargo Rack', brand: 'Rad Power Bikes', displayName: 'Rear Rack', productUrl: 'https://www.radpowerbikes.com/products/rear-rack' },
  { id: 'rad-large-basket', asin: null, category: 'Cargo Rack', brand: 'Rad Power Bikes', displayName: 'Large Basket', productUrl: 'https://www.radpowerbikes.com/products/large-basket' },
  { id: 'quietkat-ranger-rack', asin: null, category: 'Pannier Rack', brand: 'QuietKat', displayName: 'Ranger 5 Pannier Rack', productUrl: 'https://www.lowes.com/pd/QuietKat-Ranger-5-0-Pannier-Rack' },
  { id: 'ortlieb-backroller', asin: 'B00T6IR7B2', category: 'Pannier Bag', brand: 'Ortlieb', displayName: 'Back-Roller Classic Panniers (Pair)', productUrl: 'https://www.amazon.com/dp/B00T6IR7B2' },
  { id: 'ortlieb-bikepacker', asin: 'B09RQ479DL', category: 'Pannier Bag', brand: 'Ortlieb', displayName: 'Bike-Packer Plus Panniers', productUrl: 'https://www.amazon.com/dp/B09RQ479DL' },
  { id: 'arkel-orca', asin: null, category: 'Pannier Bag', brand: 'Arkel', displayName: 'Orca 45 Panniers (Pair)', productUrl: 'https://arkel.ca/products/orca-panniers' },
  { id: 'arkel-dolphin', asin: null, category: 'Pannier Bag', brand: 'Arkel', displayName: 'Dolphin 48 Panniers', productUrl: 'https://www.arkel-od.com/en/shop/panniers/dolphin-48l' },
  { id: 'quietkat-waterproof', asin: 'B087442V54', category: 'Pannier Bag', brand: 'QuietKat', displayName: 'Waterproof Pannier Bag', productUrl: 'https://www.amazon.com/dp/B087442V54' },
  { id: 'thule-shield', asin: 'B016Q7WFF8', category: 'Pannier Bag', brand: 'Thule', displayName: 'Shield Panniers (Pair)', productUrl: 'https://www.amazon.com/dp/B016Q7WFF8' },
  { id: 'thule-commuter', asin: 'B00L5H2SBQ', category: 'Pannier Bag', brand: 'Thule', displayName: "Pack 'n Pedal Commuter Pannier", productUrl: 'https://www.amazon.com/dp/B00L5H2SBQ' },
  { id: 'blackburn-local', asin: 'B00NTAB502', category: 'Pannier Bag', brand: 'Blackburn', displayName: 'Local Rear Pannier', productUrl: 'https://www.amazon.com/dp/B00NTAB502' },
  { id: 'specialized-cave-pack', asin: null, category: 'Pannier Bag', brand: 'Specialized', displayName: 'Fjallraven Cave Pack', productUrl: 'https://www.specialized.com/us/en/fjallraven-cave-pack/p/342399' },
  { id: 'topeak-mtx-exp', asin: 'B0187ZRKQ6', category: 'Cargo Bag', brand: 'Topeak', displayName: 'MTX Trunk Bag EXP', productUrl: 'https://www.amazon.com/dp/B0187ZRKQ6' },
  { id: 'topeak-mtx-dxp', asin: 'B000ZKES0S', category: 'Cargo Bag', brand: 'Topeak', displayName: 'MTX Trunk Bag DXP', productUrl: 'https://www.amazon.com/dp/B000ZKES0S' },
  { id: 'quietkat-fatkat', asin: 'B07P9VZK4X', category: 'Cargo Bag', brand: 'QuietKat', displayName: 'FatKat Pannier Rear Set', productUrl: 'https://www.amazon.com/dp/B07P9VZK4X' },
  { id: 'brooks-handlebar-roll', asin: 'B09M7WM6Z9', category: 'Handlebar Bag', brand: 'Brooks England', displayName: 'Scape Handlebar Roll', productUrl: 'https://www.amazon.com/dp/B09M7WM6Z9' },
  { id: 'brooks-handlebar-compact', asin: 'B0B9RSF6QQ', category: 'Handlebar Bag', brand: 'Brooks England', displayName: 'Scape Handlebar Compact', productUrl: 'https://www.amazon.com/dp/B0B9RSF6QQ' },
  { id: 'revelate-harness', asin: 'B00J2BGE8K', category: 'Handlebar Harness', brand: 'Revelate Designs', displayName: 'Handlebar Harness', productUrl: 'https://www.amazon.com/dp/B00J2BGE8K' },
  { id: 'revelate-sweetroll', asin: 'B01N59VGGF', category: 'Handlebar Bag', brand: 'Revelate Designs', displayName: 'Sweet Roll', productUrl: 'https://www.amazon.com/dp/B01N59VGGF' },
  { id: 'revelate-feedbag', asin: 'B00J43XG3W', category: 'Handlebar Bag', brand: 'Revelate Designs', displayName: 'Mountain Feedbag', productUrl: 'https://www.amazon.com/dp/B00J43XG3W' },
  { id: 'rambo-hauler', asin: 'B0868WD176', category: 'Bike Rack', brand: 'Rambo Bikes', displayName: 'Fat Tire Bike Hauler', productUrl: 'https://www.amazon.com/dp/B0868WD176' },
  { id: 'saris-edge', asin: 'B0DY8D2BSP', category: 'Bike Rack', brand: 'Saris', displayName: 'Edge 2-Bike Hitch Rack', productUrl: 'https://www.amazon.com/dp/B0DY8D2BSP' },
  { id: 'hollywood-sport-rider', asin: 'B08HJTFN64', category: 'Bike Rack', brand: 'Hollywood Racks', displayName: 'Sport Rider Hitch Rack', productUrl: 'https://www.amazon.com/dp/B08HJTFN64' },
  { id: 'rambo-gun-holder', asin: null, category: 'Gun/Bow Holder', brand: 'Rambo Bikes', displayName: 'Universal Gun/Bow Holder', productUrl: 'https://ebikegeneration.com/collections/rambo-accessories' },
  { id: 'rambo-rack-platform', asin: null, category: 'Cargo Basket', brand: 'Rambo Bikes', displayName: 'Rack Platform', productUrl: 'https://ebikehaul.com/products/rambo-small-basket' },
  { id: 'rambo-game-hauler', asin: null, category: 'Game Hauler', brand: 'Rambo Bikes', displayName: 'Aluminum Game Hauler', productUrl: 'https://urbanbikesdirect.com/collections/rambo-bikes-accessories' },
  { id: 'quietkat-light', asin: null, category: 'Lighting', brand: 'QuietKat', displayName: 'Hunter 800 Light', productUrl: 'https://quietkat.com/products/hunter-800-light' },
  { id: 'burley-cargo-net', asin: null, category: 'Cargo Net', brand: 'Burley', displayName: 'Cargo Net', productUrl: 'https://www.burley.com/product/cargo-net/' },
  { id: 'quietkat-ranger', asin: null, category: 'Hunting Bike', brand: 'QuietKat', displayName: 'Ranger E-Bike', productUrl: 'https://quietkat.com/products/ranger-electric-bike' },
  { id: 'aventon-aventure3', asin: null, category: 'Hunting Bike', brand: 'Aventon', displayName: 'Aventure 3 E-Bike', productUrl: 'https://www.aventon.com/products/aventure-3' },
  { id: 'bakcou-mule', asin: null, category: 'Hunting Bike', brand: 'Bakcou', displayName: 'Mule E-Bike', productUrl: 'https://bakcou.com/products/mule' },
  { id: 'rambo-megatron', asin: null, category: 'Hunting Bike', brand: 'Rambo Bikes', displayName: 'Megatron E-Bike', productUrl: 'https://www.rambobikes.com/products/megatron' },
  { id: 'quietkat-ambush', asin: null, category: 'Hunting Bike', brand: 'QuietKat', displayName: 'Ambush 750 LT E-Bike', productUrl: 'https://quietkat.com/products/ambush-750-lt' },
  { id: 'rambo-r750xp', asin: null, category: 'Hunting Bike', brand: 'Rambo Bikes', displayName: 'R750XP E-Bike', productUrl: 'https://www.rambobikes.com/products/750xp' },
  { id: 'specialized-haul-st', asin: null, category: 'Cargo Bike', brand: 'Specialized', displayName: 'Globe Haul ST', productUrl: 'https://www.specialized.com/us/en/haul-st/p/277759' },
  { id: 'specialized-haul-lt', asin: null, category: 'Cargo Bike', brand: 'Specialized', displayName: 'Globe Haul LT', productUrl: 'https://www.specialized.com/us/en/haul-lt/p/277758' },
];

function parseApiData(data) {
  if (!data || data.responseStatus !== 'PRODUCT_FOUND_RESPONSE') return null;
  let rating = 0;
  if (data.productRating) {
    const m = data.productRating.match(/(\d\.?\d?)\s*out of/);
    if (m) rating = parseFloat(m[1]);
  }
  let brand = data.manufacturer || '';
  brand = brand.replace(/^Brand:\s*/i, '').replace(/^Visit the\s*/i, '').replace(/\s*Store$/i, '').trim();
  const price = data.price > 0 ? data.price : (data.retailPrice > 0 ? data.retailPrice : 0);
  return {
    productTitle: data.productTitle || '',
    brand,
    price,
    rating,
    reviewCount: data.countReview || 0,
    mainImage: data.mainImage?.imageUrl || '',
    imageUrlList: (data.imageUrlList || []).slice(0, 5),
    features: (data.features || []).slice(0, 5),
    availability: data.warehouseAvailability || '',
  };
}

function escCsv(val) {
  const s = String(val || '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

// Load cached API responses from individual test files and the verified JSON
function loadCachedData() {
  const cache = {};

  // Load from individual api_test_*.json files (from curl tests)
  const testFiles = [
    'response_test.json', // B07Z5GB3L7
    'api_test_B00K4VLBRQ.json',
    'api_test_B0BW26F72R.json',
    'api_test_B009XMO9BM.json',
    'api_test_B0B6132N63.json',
    'api_test_B000SPMU9Q.json',
    'api_test_B00T6IR7B2.json',
    'api_test_B087442V54.json',
    'api_test_B016Q7WFF8.json',
  ];

  for (const file of testFiles) {
    const path = join(process.cwd(), file);
    if (existsSync(path)) {
      try {
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        if (data.asin) cache[data.asin] = data;
      } catch (e) { /* skip */ }
    }
  }

  // Load from verified-products.json (from the script runs)
  const verifiedPath = join(process.cwd(), 'scripts', 'verified-products.json');
  if (existsSync(verifiedPath)) {
    try {
      const results = JSON.parse(readFileSync(verifiedPath, 'utf-8'));
      for (const r of results) {
        if (r.status === 'VERIFIED' && r.api && r.asin) {
          // The api field has already-parsed data, reconstruct raw-like format
          cache[r.asin] = {
            responseStatus: 'PRODUCT_FOUND_RESPONSE',
            productTitle: r.api.productTitle,
            manufacturer: r.api.brand, // already cleaned
            price: r.api.price,
            retailPrice: r.api.retailPrice || 0,
            productRating: r.api.rating > 0 ? `${r.api.rating} out of 5 stars` : '',
            countReview: r.api.reviewCount,
            mainImage: { imageUrl: r.api.mainImage },
            imageUrlList: r.api.imageUrlList || [],
            features: r.api.features || [],
            warehouseAvailability: r.api.availability || '',
            asin: r.asin,
          };
        }
      }
    } catch (e) { /* skip */ }
  }

  return cache;
}

function main() {
  const cache = loadCachedData();
  const today = '2026-02-08';

  console.log(`Loaded ${Object.keys(cache).length} cached API responses`);

  const csvHeader = 'product_id,asin,brand,display_name,api_title,price,rating,review_count,category,main_image,image_1,image_2,image_3,image_4,image_5,amazon_url,product_url,api_status,verified_date';
  const rows = [];

  let verified = 0, fromCache = 0, noAsin = 0;

  for (const p of PRODUCTS) {
    let apiData = null;
    let status = 'NO_ASIN';

    if (p.asin) {
      const raw = cache[p.asin];
      if (raw) {
        apiData = parseApiData(raw);
        if (apiData) {
          status = 'VERIFIED';
          verified++;
          fromCache++;
        } else {
          status = 'ASIN_FOUND_NO_DATA';
        }
      } else {
        status = 'ASIN_NOT_VERIFIED';
      }
    } else {
      noAsin++;
    }

    const a = apiData || {};
    const imgs = a.imageUrlList || [];

    rows.push([
      p.id,
      p.asin || '',
      escCsv(p.brand),
      escCsv(p.displayName),
      escCsv(a.productTitle || ''),
      a.price || '',
      a.rating || '',
      a.reviewCount || '',
      p.category,
      a.mainImage || '',
      imgs[0] || '',
      imgs[1] || '',
      imgs[2] || '',
      imgs[3] || '',
      imgs[4] || '',
      p.asin ? `https://www.amazon.com/dp/${p.asin}` : '',
      p.productUrl,
      status,
      today,
    ].join(','));

    const icon = status === 'VERIFIED' ? '✓' : status === 'NO_ASIN' ? '—' : '✗';
    const detail = apiData ? `${a.rating}★ (${a.reviewCount}) $${a.price}` : '';
    console.log(`  ${icon} [${p.id}] ${p.asin || 'no-asin'} ${detail}`);
  }

  const csv = csvHeader + '\n' + rows.join('\n') + '\n';
  writeFileSync('src/data/product-media.csv', csv);

  const notVerified = PRODUCTS.filter(p => p.asin).length - verified;
  console.log(`\nDone! ${verified} verified (from cache), ${notVerified} ASINs not yet verified, ${noAsin} no ASIN`);
  console.log(`Output: src/data/product-media.csv`);

  if (notVerified > 0) {
    console.log('\nASINs needing verification (rate-limited, retry later):');
    for (const p of PRODUCTS) {
      if (p.asin && !cache[p.asin]) {
        console.log(`  ${p.id}: ${p.asin}`);
      }
    }
  }
}

main();
