// src/api/products/rapidapi/[asin].js
// API endpoint using RapidAPI Axesso service (alternative to official Amazon API)

import { RapidAPIAmazonClient, CachedRapidAPIClient } from '../../../../lib/rapidapi-amazon.js';

export async function GET({ params, request }) {
  const { asin } = params;
  
  // Validate ASIN format (10 alphanumeric characters)
  if (!/^[A-Z0-9]{10}$/i.test(asin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid ASIN format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check for RapidAPI key
  const rapidApiKey = import.meta.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    return new Response(
      JSON.stringify({ 
        error: 'RapidAPI not configured',
        message: 'Add RAPIDAPI_KEY to .env file. Get one at https://rapidapi.com/axesso/api/axesso-amazon-data-service1'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const client = new RapidAPIAmazonClient({ apiKey: rapidApiKey });
    const cachedClient = new CachedRapidAPIClient(client);
    const product = await cachedClient.getProduct(asin);

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return sanitized product data
    return new Response(
      JSON.stringify({
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: product.images.primary,
        images: product.images.variants.slice(0, 3), // Limit to 3 additional images
        features: product.features.slice(0, 5),
        availability: product.availability,
        url: product.url
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=21600' // 6 hour browser cache
        } 
      }
    );

  } catch (error) {
    console.error('RapidAPI error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch product',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
