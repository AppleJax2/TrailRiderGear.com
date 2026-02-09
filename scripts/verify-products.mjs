// verify-products.mjs
// Searches Axesso API for each product in our CSV, finds ASINs, then verifies with lookup API
// Usage: node scripts/verify-products.mjs

import { readFileSync, writeFileSync } from 'fs';

const API_KEY = 'd5bdcb8dddmshd880a1d6ea573b3p11f6bajsne4d8c953806b';
const API_HOST = 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com';

// All 52 products from real_ebike_accessories.csv
// ASINs found via browser search on amazon.com, then verified via Axesso API lookup
const PRODUCTS = [
  // === Fishing Rod Holders ===
  { id: 'ateam-universal', asin: 'B07Z5GB3L7', category: 'Fishing Rod Holder', brand: 'AteamProducts', displayName: 'Universal Strap Holder', productUrl: 'https://www.amazon.com/dp/B07Z5GB3L7' },
  { id: 'lectric-handlebar', asin: null, category: 'Fishing Rod Holder', brand: 'Lectric eBikes', displayName: 'Handlebar Rod Holder', productUrl: 'https://lectricebikes.com/products/fishing-rod-holder' },
  { id: 'bakcou-catch-release', asin: null, category: 'Fishing Rod Holder', brand: 'BAKCOU', displayName: 'Catch & Release Single Rod', productUrl: 'https://bakcou.com/products/ebike-bicycle-fishing-rod-holder' },

  // === Cargo Trailers ===
  { id: 'burley-flatbed', asin: 'B00K4VLBRQ', category: 'Cargo Trailer', brand: 'Burley', displayName: 'Flatbed Cargo Trailer', productUrl: 'https://www.amazon.com/dp/B00K4VLBRQ' },
  { id: 'burley-nomad', asin: 'B0BW26F72R', category: 'Cargo Trailer', brand: 'Burley', displayName: 'Nomad Cargo Trailer', productUrl: 'https://www.amazon.com/dp/B0BW26F72R' },
  { id: 'aventon-hitch-trailer', asin: null, category: 'Cargo Trailer', brand: 'Aventon/Burley', displayName: 'Compatible Hitch Trailer', productUrl: 'https://www.aventon.com/products/accessories' },

  // === Cargo Racks ===
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

  // === Pannier Bags ===
  { id: 'ortlieb-backroller', asin: 'B00T6IR7B2', category: 'Pannier Bag', brand: 'Ortlieb', displayName: 'Back-Roller Classic Panniers (Pair)', productUrl: 'https://www.amazon.com/dp/B00T6IR7B2' },
  { id: 'ortlieb-bikepacker', asin: 'B09RQ479DL', category: 'Pannier Bag', brand: 'Ortlieb', displayName: 'Bike-Packer Plus Panniers', productUrl: 'https://www.amazon.com/dp/B09RQ479DL' },
  { id: 'arkel-orca', asin: null, category: 'Pannier Bag', brand: 'Arkel', displayName: 'Orca 45 Panniers (Pair)', productUrl: 'https://arkel.ca/products/orca-panniers' },
  { id: 'arkel-dolphin', asin: null, category: 'Pannier Bag', brand: 'Arkel', displayName: 'Dolphin 48 Panniers', productUrl: 'https://www.arkel-od.com/en/shop/panniers/dolphin-48l' },
  { id: 'quietkat-waterproof', asin: 'B087442V54', category: 'Pannier Bag', brand: 'QuietKat', displayName: 'Waterproof Pannier Bag', productUrl: 'https://www.amazon.com/dp/B087442V54' },
  { id: 'thule-shield', asin: 'B016Q7WFF8', category: 'Pannier Bag', brand: 'Thule', displayName: 'Shield Panniers (Pair)', productUrl: 'https://www.amazon.com/dp/B016Q7WFF8' },
  { id: 'thule-commuter', asin: 'B00L5H2SBQ', category: 'Pannier Bag', brand: 'Thule', displayName: "Pack 'n Pedal Commuter Pannier", productUrl: 'https://www.amazon.com/dp/B00L5H2SBQ' },
  { id: 'blackburn-local', asin: 'B00NTAB502', category: 'Pannier Bag', brand: 'Blackburn', displayName: 'Local Rear Pannier', productUrl: 'https://www.amazon.com/dp/B00NTAB502' },
  { id: 'specialized-cave-pack', asin: null, category: 'Pannier Bag', brand: 'Specialized', displayName: 'Fjallraven Cave Pack', productUrl: 'https://www.specialized.com/us/en/fjallraven-cave-pack/p/342399' },

  // === Cargo Bags ===
  { id: 'topeak-mtx-exp', asin: 'B0187ZRKQ6', category: 'Cargo Bag', brand: 'Topeak', displayName: 'MTX Trunk Bag EXP', productUrl: 'https://www.amazon.com/dp/B0187ZRKQ6' },
  { id: 'topeak-mtx-dxp', asin: 'B000ZKES0S', category: 'Cargo Bag', brand: 'Topeak', displayName: 'MTX Trunk Bag DXP', productUrl: 'https://www.amazon.com/dp/B000ZKES0S' },
  { id: 'quietkat-fatkat', asin: 'B07P9VZK4X', category: 'Cargo Bag', brand: 'QuietKat', displayName: 'FatKat Pannier Rear Set', productUrl: 'https://www.amazon.com/dp/B07P9VZK4X' },

  // === Handlebar Bags ===
  { id: 'brooks-handlebar-roll', asin: 'B09M7WM6Z9', category: 'Handlebar Bag', brand: 'Brooks England', displayName: 'Scape Handlebar Roll', productUrl: 'https://www.amazon.com/dp/B09M7WM6Z9' },
  { id: 'brooks-handlebar-compact', asin: 'B0B9RSF6QQ', category: 'Handlebar Bag', brand: 'Brooks England', displayName: 'Scape Handlebar Compact', productUrl: 'https://www.amazon.com/dp/B0B9RSF6QQ' },
  { id: 'revelate-harness', asin: 'B00J2BGE8K', category: 'Handlebar Harness', brand: 'Revelate Designs', displayName: 'Handlebar Harness', productUrl: 'https://www.amazon.com/dp/B00J2BGE8K' },
  { id: 'revelate-sweetroll', asin: 'B01N59VGGF', category: 'Handlebar Bag', brand: 'Revelate Designs', displayName: 'Sweet Roll', productUrl: 'https://www.amazon.com/dp/B01N59VGGF' },
  { id: 'revelate-feedbag', asin: 'B00J43XG3W', category: 'Handlebar Bag', brand: 'Revelate Designs', displayName: 'Mountain Feedbag', productUrl: 'https://www.amazon.com/dp/B00J43XG3W' },

  // === Bike Racks (Car/Hitch) ===
  { id: 'rambo-hauler', asin: 'B0868WD176', category: 'Bike Rack', brand: 'Rambo Bikes', displayName: 'Fat Tire Bike Hauler', productUrl: 'https://www.amazon.com/dp/B0868WD176' },
  { id: 'saris-edge', asin: 'B0DY8D2BSP', category: 'Bike Rack', brand: 'Saris', displayName: 'Edge 2-Bike Hitch Rack', productUrl: 'https://www.amazon.com/dp/B0DY8D2BSP' },
  { id: 'hollywood-sport-rider', asin: 'B08HJTFN64', category: 'Bike Rack', brand: 'Hollywood Racks', displayName: 'Sport Rider Hitch Rack', productUrl: 'https://www.amazon.com/dp/B08HJTFN64' },

  // === Misc Accessories ===
  { id: 'rambo-gun-holder', asin: null, category: 'Gun/Bow Holder', brand: 'Rambo Bikes', displayName: 'Universal Gun/Bow Holder', productUrl: 'https://ebikegeneration.com/collections/rambo-accessories' },
  { id: 'rambo-rack-platform', asin: null, category: 'Cargo Basket', brand: 'Rambo Bikes', displayName: 'Rack Platform', productUrl: 'https://ebikehaul.com/products/rambo-small-basket' },
  { id: 'rambo-game-hauler', asin: null, category: 'Game Hauler', brand: 'Rambo Bikes', displayName: 'Aluminum Game Hauler', productUrl: 'https://urbanbikesdirect.com/collections/rambo-bikes-accessories' },
  { id: 'quietkat-light', asin: null, category: 'Lighting', brand: 'QuietKat', displayName: 'Hunter 800 Light', productUrl: 'https://quietkat.com/products/hunter-800-light' },
  { id: 'burley-cargo-net', asin: null, category: 'Cargo Net', brand: 'Burley', displayName: 'Cargo Net', productUrl: 'https://www.burley.com/product/cargo-net/' },

  // === Hunting Bikes (no Amazon ASINs - sold direct) ===
  { id: 'quietkat-ranger', asin: null, category: 'Hunting Bike', brand: 'QuietKat', displayName: 'Ranger E-Bike', productUrl: 'https://quietkat.com/products/ranger-electric-bike' },
  { id: 'aventon-aventure3', asin: null, category: 'Hunting Bike', brand: 'Aventon', displayName: 'Aventure 3 E-Bike', productUrl: 'https://www.aventon.com/products/aventure-3' },
  { id: 'bakcou-mule', asin: null, category: 'Hunting Bike', brand: 'Bakcou', displayName: 'Mule E-Bike', productUrl: 'https://bakcou.com/products/mule' },
  { id: 'rambo-megatron', asin: null, category: 'Hunting Bike', brand: 'Rambo Bikes', displayName: 'Megatron E-Bike', productUrl: 'https://www.rambobikes.com/products/megatron' },
  { id: 'quietkat-ambush', asin: null, category: 'Hunting Bike', brand: 'QuietKat', displayName: 'Ambush 750 LT E-Bike', productUrl: 'https://quietkat.com/products/ambush-750-lt' },
  { id: 'rambo-r750xp', asin: null, category: 'Hunting Bike', brand: 'Rambo Bikes', displayName: 'R750XP E-Bike', productUrl: 'https://www.rambobikes.com/products/750xp' },

  // === Cargo Bikes (no Amazon ASINs - sold direct) ===
  { id: 'specialized-haul-st', asin: null, category: 'Cargo Bike', brand: 'Specialized', displayName: 'Globe Haul ST', productUrl: 'https://www.specialized.com/us/en/haul-st/p/277759' },
  { id: 'specialized-haul-lt', asin: null, category: 'Cargo Bike', brand: 'Specialized', displayName: 'Globe Haul LT', productUrl: 'https://www.specialized.com/us/en/haul-lt/p/277758' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function lookupProduct(asin) {
  const amazonUrl = `https://www.amazon.com/dp/${asin}`;
  const url = new URL(`https://${API_HOST}/amz/amazon-lookup-product`);
  url.searchParams.append('url', amazonUrl);
  url.searchParams.append('domainCode', 'com');

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST,
    }
  });

  if (!res.ok) {
    console.error(`  Lookup failed: ${res.status}`);
    return null;
  }

  const data = await res.json();
  if (!data || !data.responseStatus || data.responseStatus !== 'PRODUCT_FOUND_RESPONSE') {
    return null;
  }

  // Parse rating from string like "4.5 out of 5 stars"
  let rating = 0;
  if (data.productRating) {
    const m = data.productRating.match(/(\d\.?\d?)\s*out of/);
    if (m) rating = parseFloat(m[1]);
  }

  // Parse brand - strip "Brand: " or "Visit the X Store"
  let brand = data.manufacturer || '';
  brand = brand.replace(/^Brand:\s*/i, '').replace(/^Visit the\s*/i, '').replace(/\s*Store$/i, '').trim();

  return {
    asin: data.asin || asin,
    productTitle: data.productTitle || '',
    brand,
    price: data.price || 0,
    retailPrice: data.retailPrice || 0,
    rating,
    reviewCount: data.countReview || 0,
    mainImage: data.mainImage?.imageUrl || '',
    imageUrlList: (data.imageUrlList || []).slice(0, 5),
    features: (data.features || []).slice(0, 5),
    availability: data.warehouseAvailability || '',
    responseStatus: data.responseStatus,
  };
}

function escCsv(val) {
  const s = String(val || '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const results = [];
  const today = new Date().toISOString().split('T')[0];
  const withAsin = PRODUCTS.filter(p => p.asin);
  const withoutAsin = PRODUCTS.filter(p => !p.asin);

  console.log(`Total products: ${PRODUCTS.length}`);
  console.log(`With ASIN (will verify): ${withAsin.length}`);
  console.log(`Without ASIN (manufacturer-only): ${withoutAsin.length}\n`);

  // Verify all products that have ASINs
  for (const product of withAsin) {
    console.log(`[${product.id}] Looking up ${product.asin}...`);
    const details = await lookupProduct(product.asin);
    if (details) {
      console.log(`  ✓ ${details.productTitle.substring(0, 60)} | $${details.price} | ${details.rating}★ (${details.reviewCount})`);
      results.push({ ...product, api: details, status: 'VERIFIED', verified_date: today });
    } else {
      console.log(`  ✗ Lookup failed`);
      results.push({ ...product, api: null, status: 'LOOKUP_FAILED', verified_date: today });
    }
    // Save individual cache file
    if (details) {
      writeFileSync(`scripts/cache_${product.asin}.json`, JSON.stringify(details, null, 2));
    }
    await sleep(3000);
  }

  // Add manufacturer-only products (no API call needed)
  for (const product of withoutAsin) {
    results.push({ ...product, api: null, status: 'NO_ASIN', verified_date: today });
  }

  // Write JSON
  writeFileSync('scripts/verified-products.json', JSON.stringify(results, null, 2));

  // Write CSV
  const csvHeader = 'product_id,asin,brand,display_name,api_title,price,rating,review_count,category,main_image,image_1,image_2,image_3,image_4,image_5,amazon_url,product_url,api_status,verified_date';
  const csvRows = results.map(r => {
    const a = r.api || {};
    const imgs = a.imageUrlList || [];
    return [
      r.id,
      r.asin || '',
      escCsv(r.brand),
      escCsv(r.displayName),
      escCsv(a.productTitle || ''),
      a.price || '',
      a.rating || '',
      a.reviewCount || '',
      r.category,
      a.mainImage || '',
      imgs[0] || '',
      imgs[1] || '',
      imgs[2] || '',
      imgs[3] || '',
      imgs[4] || '',
      r.asin ? `https://www.amazon.com/dp/${r.asin}` : '',
      r.productUrl,
      r.status,
      r.verified_date,
    ].join(',');
  });

  writeFileSync('src/data/product-media.csv', csvHeader + '\n' + csvRows.join('\n') + '\n');

  // Summary
  const verified = results.filter(r => r.status === 'VERIFIED').length;
  const failed = results.filter(r => r.status === 'LOOKUP_FAILED').length;
  const noAsin = results.filter(r => r.status === 'NO_ASIN').length;
  console.log(`\nDone! ${verified} verified, ${failed} failed, ${noAsin} no ASIN (manufacturer-only)`);
  console.log(`Output: scripts/verified-products.json + src/data/product-media.csv`);
}

main().catch(console.error);
