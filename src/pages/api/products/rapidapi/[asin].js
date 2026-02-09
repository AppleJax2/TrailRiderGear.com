// src/pages/api/products/rapidapi/[asin].js
// API endpoint using RapidAPI Axesso service
// Real API response structure verified 2026-02-08 via curl

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET({ params }) {
  const { asin } = params;
  
  if (!/^[A-Z0-9]{10}$/i.test(asin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid ASIN format' }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const rapidApiKey = import.meta.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    return new Response(
      JSON.stringify({ error: 'RapidAPI not configured', message: 'Add RAPIDAPI_KEY to .env' }),
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const amazonUrl = `https://www.amazon.com/dp/${asin}`;
    const url = new URL('https://axesso-axesso-amazon-data-service-v1.p.rapidapi.com/amz/amazon-lookup-product');
    url.searchParams.append('url', amazonUrl);
    url.searchParams.append('domainCode', 'com');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const product = await response.json();

    // Verified real Axesso response fields (2026-02-08):
    //   productTitle, manufacturer, price, retailPrice, productRating,
    //   countReview, mainImage.imageUrl, imageUrlList[], features[],
    //   warehouseAvailability, responseStatus
    if (!product || product.responseStatus !== 'PRODUCT_FOUND_RESPONSE') {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Parse rating from string like "4.5 out of 5 stars"
    let rating = 0;
    if (product.productRating) {
      const m = product.productRating.match(/(\d\.?\d?)\s*out of/);
      if (m) rating = parseFloat(m[1]);
    }

    // Parse brand - strip "Brand: " or "Visit the X Store"
    let brand = product.manufacturer || '';
    brand = brand.replace(/^Brand:\s*/i, '').replace(/^Visit the\s*/i, '').replace(/\s*Store$/i, '').trim();

    // Determine best price
    const price = product.price > 0 ? product.price : (product.retailPrice > 0 ? product.retailPrice : 0);

    const result = {
      asin,
      title: product.productTitle || 'Unknown Product',
      brand,
      price: price > 0 ? `$${price}` : 'Price unavailable',
      image: product.mainImage?.imageUrl || null,
      images: (product.imageUrlList || []).slice(0, 5),
      rating,
      reviewCount: product.countReview || 0,
      features: (product.features || []).slice(0, 5),
      availability: product.warehouseAvailability || '',
      url: amazonUrl
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...CORS_HEADERS, 'Cache-Control': 'public, max-age=21600' } }
    );

  } catch (error) {
    console.error('RapidAPI error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch product', message: error.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
