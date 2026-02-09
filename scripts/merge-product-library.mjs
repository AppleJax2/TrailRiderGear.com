#!/usr/bin/env node
// merge-product-library.mjs
// Merges ALL product data into one comprehensive product-library.json
// Sources: today's API run + Puppeteer scrapes + existing blog post data

import { readFileSync, writeFileSync } from 'fs';

const AFFILIATE_TAG = 'trailridergea-20';
const OUTPUT = 'scripts/product-library.json';

// Load existing library (today's API results)
const existing = JSON.parse(readFileSync(OUTPUT, 'utf8'));
const products = new Map();

// Index existing products by ASIN
for (const p of existing.products) {
  products.set(p.asin, p);
}

// ---------------------------------------------------------------------------
// PUPPETEER-SCRAPED E-BIKES (full product page data, no API cost)
// ---------------------------------------------------------------------------
const puppeteerEbikes = [
  {
    asin: 'B0FBJYRDD7',
    id: 'freesky-ranger-air',
    category: 'hunting-ebike',
    targetPosts: ['best-hunting-ebikes-2026', 'best-offroad-ebikes-2026'],
    status: 'PUPPETEER_SCRAPED',
    name: 'Ranger AIR Dual Motor 3500W Electric Bike',
    brand: 'FREESKY',
    price: '$999.00',
    rating: 4.9,
    reviewCount: 76,
    image: 'https://m.media-amazon.com/images/I/71NcRsyBoFL._AC_SX522_.jpg',
    features: [
      '3500W AI Dual Motor with smart power distribution',
      '105-mile range with 48V 25Ah removable battery',
      'Full suspension + 26" fat tires + step-through frame',
      '7 riding modes including dual/single motor',
      'NFC keyless unlock smart LCD display'
    ],
    _fullTitle: 'FREESKY Ranger AIR Dual Motor Electric Bike for Adults, 3500W 200NM Fast Ebike,105Miles Long Range E Bike,Full Suspension Electric Mountain Bike, 26\'\' Fat Tire Electric Bicycle for Man Womens Hunters',
    _availability: 'Only 2 left in stock - order soon.',
  },
  {
    asin: 'B0GDM5QRDK',
    id: 'wallke-h9-ultra',
    category: 'highperf-ebike',
    targetPosts: ['best-highperformance-ebikes', 'best-offroad-ebikes-2026'],
    status: 'PUPPETEER_SCRAPED',
    name: 'H9 ULTRA 4000W Electric Bike + Solar Power Station',
    brand: 'Wallke',
    price: '$2,399.00',
    rating: 4.8,
    reviewCount: 107,
    image: 'https://m.media-amazon.com/images/I/712+tsdX9SL._AC_SX522_.jpg',
    features: [
      '2-in-1: E-bike + 2640Wh solar portable power station',
      '4000W motor, 40MPH top speed, torque sensor',
      '48V 55Ah battery, 90-180 mile range',
      '20" fat tire, full air suspension',
      'UL-certified, 1000+ deep cycle battery life'
    ],
    _fullTitle: 'Wallke H9 ULTRA 2-in-1 4000W Electric Bike for Adults & Solar Portable Power Station, 40MPH Fast Ebike, 48V 55Ah 180 Mile Long Range eBike with Torque Sensor, 20 Fat Tire All Terrain Air Suspension,UL',
    _availability: 'In Stock',
  },
  {
    asin: 'B0DK9J5TN3',
    id: 'freesky-2000w',
    category: 'offroad-ebike',
    targetPosts: ['best-offroad-ebikes-2026', 'best-budget-offroad-ebikes'],
    status: 'PUPPETEER_SCRAPED',
    name: '2000W Electric Bike, 37MPH, 95 Miles Range',
    brand: 'FREESKY',
    price: '$899.00',
    rating: 4.8,
    reviewCount: 99,
    image: 'https://m.media-amazon.com/images/I/71Ep-0yjwhL._AC_SX522_.jpg',
    features: [
      'Peak 2000W motor, 130 N.m torque, 40° climb',
      '48V 25Ah battery, 50-95 mile range',
      'Full suspension with lockable hydraulic fork',
      '4-piston hydraulic disc brakes, 180mm rotors',
      '26" fat tires, full fenders, rear rack included'
    ],
    _fullTitle: 'FREESKY 2000W Electric Bike for Adults, 37MPH & 95Miles Range, Dirt All-Terrain Electric Bicycle, 48V 25Ah Removable Battery,26" Fat Tire Full Suspension Mountain Ebike, UL2849 Certified by TÜV',
    _availability: 'Only 2 left in stock - order soon.',
  },
  {
    asin: 'B0F7FQ5VYX',
    id: 'freesky-2500w-bafang',
    category: 'highperf-ebike',
    targetPosts: ['best-highperformance-ebikes', 'best-offroad-ebikes-2026'],
    status: 'PUPPETEER_SCRAPED',
    name: '2500W BAFANG Motor Electric Bike, 120 Miles',
    brand: 'FREESKY',
    price: '$1,399.00',
    rating: 4.8,
    reviewCount: 148,
    image: 'https://m.media-amazon.com/images/I/71FMIolfM6L._AC_SX522_.jpg',
    features: [
      '2500W BAFANG motor, 140Nm torque, 38+ MPH',
      '48V 30Ah Samsung cells battery, 120 mile range',
      'DNM air rear shock + double crown fork suspension',
      '4-piston hydraulic disc brakes',
      'UL 2849 certified by TÜV, rear rack + fenders'
    ],
    _fullTitle: 'FREESKY 2500W BAFANG Motor Electric Bike for Adults, 48V 30Ah Samsung Cells Battery Ebike 120 Miles, 38+MPH, 26" Fat Tire Dirt All-Terrain Mountain E Bike, Full Suspension, UL 2849 Certified by TÜV',
    _availability: 'Only 4 left in stock - order soon.',
  },
  {
    asin: 'B0DKF2LWKR',
    id: 'kebiko-1000w-folding',
    category: 'budget-ebike',
    targetPosts: ['best-budget-offroad-ebikes'],
    status: 'PUPPETEER_SCRAPED',
    name: '1000W Folding Electric Bike, 80 Miles Range',
    brand: 'Kebiko',
    price: '$899.00',
    rating: 4.6,
    reviewCount: 296,
    image: 'https://m.media-amazon.com/images/I/71iNh4J40FL._AC_SX522_.jpg',
    features: [
      'Peak 1000W motor, 30+ MPH top speed',
      '48V 20Ah removable battery, 40-80 mile range',
      '20" fat tire, front suspension, dual disc brakes',
      'Foldable step-through frame, 65 lbs',
      'LCD display with USB charging, 3 riding modes'
    ],
    _fullTitle: '1000W Folding Electric Bike,48V 20AH Removable Battery E Bike,30+MPH,80 Miles Max Range Electric Bike for Adults,20" Fat Tire Foldable ebike,Adult Electric Bicycle for Commute Beach Snow',
    _availability: 'In Stock',
  },
  {
    asin: 'B0FNMRQ472',
    id: 'freesky-4000w-dual',
    category: 'highperf-ebike',
    targetPosts: ['best-highperformance-ebikes'],
    status: 'PUPPETEER_SEARCH',
    name: '4000W Dual Motor Electric Bike, 120 Miles, 40MPH AWD',
    brand: 'FREESKY',
    price: '$1,649.00',
    rating: 0,
    reviewCount: 70,
    image: 'https://m.media-amazon.com/images/I/71BVMUWl33L._AC_UY218_.jpg',
    features: ['4000W dual motor AWD', '48V 30Ah Samsung cells', '120 mile range', '40MPH top speed', '26" fat tire full suspension'],
    _fullTitle: 'FREESKY 4000W Dual Motor Electric Bike for Adults, 48V 30AH Samsung Cells Battery 120Miles Range, 40MPH AWD Fast E-Bike, 26" Fat Tire Full Suspension',
  },
  {
    asin: 'B0D91N7QYY',
    id: 'folding-1000w-fattire',
    category: 'budget-ebike',
    targetPosts: ['best-budget-offroad-ebikes'],
    status: 'PUPPETEER_SEARCH',
    name: 'Folding Electric Bike 1000W, 48V 20AH, 80 Miles',
    brand: 'Unknown',
    price: '$599.99',
    rating: 0,
    reviewCount: 185,
    image: 'https://m.media-amazon.com/images/I/71iNh4J40FL._AC_UY218_.jpg',
    features: ['1000W peak motor', '48V 20Ah battery', '30+ MPH, 80 miles range', '20" fat tire foldable', 'All terrain'],
    _fullTitle: 'Folding Electric Bike for Adults with Peak 1000W Motor, 48V 20AH Battery up to 30MPH 80 Miles, 20" Fat Tire All Terrain',
  },
  {
    asin: 'B0CQNRQS5W',
    id: 'puckipuppy-boxer',
    category: 'offroad-ebike',
    targetPosts: ['best-offroad-ebikes-2026'],
    status: 'PUPPETEER_SEARCH',
    name: 'Boxer Electric Bike 960W, Full Suspension 26" Fat Tire',
    brand: 'PUCKIPUPPY',
    price: '',
    rating: 0,
    reviewCount: 143,
    image: 'https://m.media-amazon.com/images/I/71OKeu67EfL._AC_UY218_.jpg',
    features: ['960W motor', '48V 20Ah battery', 'Full suspension', '26" fat tire', '28MPH 80 miles'],
    _fullTitle: 'PUCKIPUPPY Boxer Electric Bike for Adults 960W, 48V 20AH Battery Ebike, Full Suspension 26" Fat Tire E Bike, 28MPH 80Miles Range',
  },
  {
    asin: 'B0FDG79Z9C',
    id: 'ebycco-6000w',
    category: 'highperf-ebike',
    targetPosts: ['best-highperformance-ebikes'],
    status: 'PUPPETEER_SEARCH',
    name: '6000W Peak Dual Motor Ebike, 52V 32AH, 100 Miles',
    brand: 'EBycco',
    price: '$1,299.00',
    rating: 0,
    reviewCount: 58,
    image: 'https://m.media-amazon.com/images/I/71Mgf8y-WPL._AC_UY218_.jpg',
    features: ['6000W dual motor', '52V 32Ah battery', '40-45 MPH', '100 mile range', 'Full suspension hydraulic brakes'],
    _fullTitle: 'EBycco 6000W Peak Dual Motor Ebike for Adults Electric Bike 52V 32AH, Max 40-45 MPH, 100 Miles Long Range, Full Suspension Hydraulic Disc Brake',
  },
];

// ---------------------------------------------------------------------------
// PREVIOUSLY VERIFIED ACCESSORIES (from existing blog posts)
// These are products already used in published guides with known-good data
// ---------------------------------------------------------------------------
const blogPostAccessories = [
  {
    asin: 'B08F4CYHNH',
    id: 'bike-fisherman-2rod',
    category: 'fishing-rod-holder',
    targetPosts: ['ebike-fishing-rod-holders-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Bike Fisherman 2-Rod Holder',
    brand: 'Bike Fisherman',
    price: '$34',
    rating: 4.5,
    reviewCount: 562,
    image: 'https://m.media-amazon.com/images/I/81A+Tss70QL._AC_SX522_.jpg',
    features: ['Holds 2 rods securely', 'UV-resistant ABS polymer', 'Easy handlebar mounting'],
    pros: ["Amazon's Choice product", '100+ bought per month'],
    cons: ['Handlebar mount only', 'May not fit oversized bars'],
  },
  {
    asin: 'B0G6ZJFDSL',
    id: 'geartrust-adjustable',
    category: 'fishing-rod-holder',
    targetPosts: ['ebike-fishing-rod-holders-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Adjustable Fishing Rod Holder',
    brand: 'GearTrust',
    price: '$22',
    rating: 4.3,
    reviewCount: 26,
    image: 'https://m.media-amazon.com/images/I/616tk7Mu+IL._AC_SX522_.jpg',
    features: ['Aluminum + plastic construction', 'Adjustable angle & height', 'Fits bikes, ATVs, boats, carts'],
    pros: ['Works on e-bikes and ATVs', 'Budget-friendly at $22'],
    cons: ['Newer product with fewer reviews', 'Single rod only'],
  },
  {
    asin: 'B07Z5GB3L7',
    id: 'ateam-universal',
    category: 'fishing-rod-holder',
    targetPosts: ['ebike-fishing-rod-holders-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Universal Strap Holder',
    brand: 'AteamProducts',
    price: '$35',
    rating: 3.5,
    reviewCount: 117,
    image: 'https://m.media-amazon.com/images/I/81J9eWaBfPL._AC_SX679_.jpg',
    features: ['Tool-free installation', 'Fits most frame geometries', 'Easy to remove'],
    pros: ['Works on multiple bikes', 'No tools required'],
    cons: ['Straps may loosen on rough terrain', 'Not as durable as metal mounts'],
  },
  {
    asin: 'B00K4VLBRQ',
    id: 'burley-flatbed',
    category: 'cargo-trailer',
    targetPosts: ['ebike-cargo-trailers-racks-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Flatbed Cargo Trailer',
    brand: 'Burley',
    price: '$399',
    rating: 4.5,
    reviewCount: 433,
    image: 'https://m.media-amazon.com/images/I/81v39PE7pNL._AC_SX679_.jpg',
    features: ['100 lb capacity', 'Universal hitch system', 'Folds flat for storage'],
    pros: ['Decades-proven durability', 'Open platform for irregular cargo'],
    cons: ['Requires thru-axle adapter for some e-bikes', 'Cargo exposed to weather'],
  },
  {
    asin: 'B0BW26F72R',
    id: 'burley-nomad',
    category: 'cargo-trailer',
    targetPosts: ['ebike-cargo-trailers-racks-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Nomad Cargo Trailer',
    brand: 'Burley',
    price: '$370',
    rating: 4.5,
    reviewCount: 56,
    image: 'https://m.media-amazon.com/images/I/6145dcQYZaL._AC_SX679_.jpg',
    features: ['Weather-resistant cover', '100 lb capacity', 'Roll-top closure'],
    pros: ['Same capacity as Flatbed', 'Protection from rain and road spray'],
    cons: ['$50 premium over Flatbed', 'Creates wind resistance on descents'],
  },
  {
    asin: 'B009XMO9BM',
    id: 'topeak-explorer',
    category: 'cargo-rack',
    targetPosts: ['ebike-cargo-trailers-racks-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Explorer Rear Rack',
    brand: 'Topeak',
    price: '$75',
    rating: 5.0,
    reviewCount: 2,
    image: 'https://m.media-amazon.com/images/I/51qJrYH-DeL._AC_SX679_.jpg',
    features: ['57 lb capacity', 'Disc brake compatible', 'MTX QuickTrack interface'],
    pros: ['Wirecutter recommended', 'Decade-plus proven design'],
    cons: ['Requires frame eyelets', 'Check bolts periodically on e-bikes'],
  },
  {
    asin: 'B0B6132N63',
    id: 'thule-tour-rack',
    category: 'cargo-rack',
    targetPosts: ['ebike-cargo-trailers-racks-guide'],
    status: 'IN_PUBLISHED_POST',
    name: "Pack 'n Pedal Tour Rack",
    brand: 'Thule',
    price: '$195',
    rating: 4.3,
    reviewCount: 3251,
    image: 'https://m.media-amazon.com/images/I/71oiCcQBsRL._AC_SX679_.jpg',
    features: ['Seatpost/frame mount', '55 lb capacity', 'Solid aluminum top plate'],
    pros: ['No eyelets required', 'Adjustable for odd frame shapes'],
    cons: ['$120 more than Topeak', 'Lower capacity than Explorer'],
  },
  {
    asin: 'B000SPMU9Q',
    id: 'planet-eco-rack',
    category: 'cargo-rack',
    targetPosts: ['ebike-cargo-trailers-racks-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Eco Rear Rack',
    brand: 'Planet Bike',
    price: '$50',
    rating: 4.4,
    reviewCount: 618,
    image: 'https://m.media-amazon.com/images/I/51GYvU7OYjL._AC_SX679_.jpg',
    features: ['55 lb capacity', 'Standard frame fit', 'Classic aluminum design'],
    pros: ['Budget-friendly price', 'Works on most standard frames'],
    cons: ['Threaded eyelets can fatigue', 'Basic construction'],
  },
  {
    asin: 'B00T6IR7B2',
    id: 'ortlieb-backroller',
    category: 'pannier-bag',
    targetPosts: ['ebike-waterproof-panniers-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Back-Roller Classic Panniers (Pair)',
    brand: 'Ortlieb',
    price: '$185',
    rating: 4.7,
    reviewCount: 1200,
    image: 'https://m.media-amazon.com/images/I/71QQ8nFuvPL._AC_SX679_.jpg',
    features: ['20L per pannier (40L pair)', 'IP64 waterproof', 'Quick-Lock mounting'],
    pros: ['Industry gold standard for waterproofing', 'Bombproof construction'],
    cons: ['Premium price', 'No internal organization pockets'],
  },
  {
    asin: 'B087442V54',
    id: 'quietkat-waterproof',
    category: 'pannier-bag',
    targetPosts: ['ebike-waterproof-panniers-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Waterproof Pannier Bag',
    brand: 'QuietKat',
    price: '$129',
    rating: 4.0,
    reviewCount: 45,
    image: 'https://m.media-amazon.com/images/I/71kMqWv3rTL._AC_SX679_.jpg',
    features: ['Marine-grade waterproof', 'Designed for fat tire e-bikes', 'Quick-release mounting'],
    pros: ['Made for hunting e-bikes specifically', 'Camo options available'],
    cons: ['Single bag (not a pair)', 'Limited color options'],
  },
  {
    asin: 'B016Q7WFF8',
    id: 'thule-shield',
    category: 'pannier-bag',
    targetPosts: ['ebike-waterproof-panniers-guide'],
    status: 'IN_PUBLISHED_POST',
    name: 'Shield Panniers (Pair)',
    brand: 'Thule',
    price: '$160',
    rating: 4.5,
    reviewCount: 350,
    image: 'https://m.media-amazon.com/images/I/71Y8W4NLGQL._AC_SX679_.jpg',
    features: ['25L per pannier (50L pair)', 'Welded seam waterproofing', 'Reflective elements'],
    pros: ['Great value for a pair', 'Thule brand reliability'],
    cons: ['Slightly less waterproof than Ortlieb', 'Roll-top can be fiddly'],
  },
];

// ---------------------------------------------------------------------------
// MERGE: Add Puppeteer e-bikes (don't overwrite API data if it exists)
// ---------------------------------------------------------------------------
for (const bike of puppeteerEbikes) {
  if (!products.has(bike.asin)) {
    products.set(bike.asin, {
      ...bike,
      amazonUrl: `https://www.amazon.com/dp/${bike.asin}?tag=${AFFILIATE_TAG}`,
      pros: bike.pros || [],
      cons: bike.cons || [],
      fetchedAt: new Date().toISOString(),
    });
  }
}

// ---------------------------------------------------------------------------
// MERGE: Add blog post accessories (these have editorial data already)
// ---------------------------------------------------------------------------
for (const acc of blogPostAccessories) {
  if (!products.has(acc.asin)) {
    products.set(acc.asin, {
      ...acc,
      amazonUrl: `https://www.amazon.com/dp/${acc.asin}?tag=${AFFILIATE_TAG}`,
      pros: acc.pros || [],
      cons: acc.cons || [],
      fetchedAt: new Date().toISOString(),
    });
  }
}

// ---------------------------------------------------------------------------
// BUILD FINAL LIBRARY — sorted by category then brand
// ---------------------------------------------------------------------------
const categoryOrder = [
  'hunting-ebike', 'offroad-ebike', 'highperf-ebike', 'budget-ebike', 'commuter-ebike',
  'fishing-rod-holder', 'cargo-trailer', 'cargo-rack', 'pannier-bag', 'handlebar-bag',
  'cargo-bag', 'bike-rack'
];

const allProducts = Array.from(products.values()).sort((a, b) => {
  const catA = categoryOrder.indexOf(a.category);
  const catB = categoryOrder.indexOf(b.category);
  if (catA !== catB) return (catA === -1 ? 99 : catA) - (catB === -1 ? 99 : catB);
  return (a.brand || '').localeCompare(b.brand || '');
});

const library = {
  lastUpdated: new Date().toISOString(),
  totalProducts: allProducts.length,
  summary: {
    ebikes: allProducts.filter(p => p.category?.includes('ebike')).length,
    accessories: allProducts.filter(p => !p.category?.includes('ebike')).length,
    verified: allProducts.filter(p => p.status === 'VERIFIED').length,
    puppeteerScraped: allProducts.filter(p => p.status?.startsWith('PUPPETEER')).length,
    fromPublishedPosts: allProducts.filter(p => p.status === 'IN_PUBLISHED_POST').length,
  },
  products: allProducts,
};

writeFileSync(OUTPUT, JSON.stringify(library, null, 2));

// Print summary
console.log('='.repeat(60));
console.log('PRODUCT LIBRARY REBUILT');
console.log('='.repeat(60));
console.log(`Total products: ${library.totalProducts}`);
console.log(`  E-bikes:     ${library.summary.ebikes}`);
console.log(`  Accessories: ${library.summary.accessories}`);
console.log(`  API verified:       ${library.summary.verified}`);
console.log(`  Puppeteer scraped:  ${library.summary.puppeteerScraped}`);
console.log(`  From published posts: ${library.summary.fromPublishedPosts}`);
console.log('');

let lastCat = '';
for (const p of allProducts) {
  if (p.category !== lastCat) {
    console.log(`\n--- ${p.category.toUpperCase()} ---`);
    lastCat = p.category;
  }
  const status = { VERIFIED: '✓API', PUPPETEER_SCRAPED: '✓PUP', PUPPETEER_SEARCH: '~PUP', IN_PUBLISHED_POST: '✓PUB', FETCH_FAILED: '✗FAIL' }[p.status] || p.status;
  console.log(`  [${status}] ${p.asin} | ${p.brand.padEnd(14).substring(0,14)} | ${(p.price||'N/A').padEnd(10)} | ${p.rating?p.rating+'★':'---'} (${p.reviewCount}) | ${p.name?.substring(0,50)}`);
}

console.log(`\nSaved to ${OUTPUT}`);
