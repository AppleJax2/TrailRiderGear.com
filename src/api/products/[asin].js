// src/api/products/[asin].js
// Astro API endpoint for fetching Amazon product data
// Usage: GET /api/products/B07Z5GB3L7

import { AmazonCreatorsAPI, CachedAmazonAPI } from '../../../lib/amazon-creators-api.js';

export async function GET({ params, request }) {
  const { asin } = params;
  
  // Validate ASIN format (10 alphanumeric characters)
  if (!/^[A-Z0-9]{10}$/i.test(asin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid ASIN format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check for required environment variables
  const credentialId = import.meta.env.AMAZON_CREDENTIAL_ID;
  const credentialSecret = import.meta.env.AMAZON_CREDENTIAL_SECRET;
  
  if (!credentialId || !credentialSecret) {
    return new Response(
      JSON.stringify({ 
        error: 'Amazon API not configured',
        message: 'Add AMAZON_CREDENTIAL_ID and AMAZON_CREDENTIAL_SECRET to .env'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const api = new AmazonCreatorsAPI({
      credentialId,
      credentialSecret,
      partnerTag: import.meta.env.AMAZON_PARTNER_TAG || 'trailridergea-20',
      marketplace: import.meta.env.AMAZON_MARKETPLACE || 'www.amazon.com'
    });

    const cachedApi = new CachedAmazonAPI(api);
    const product = await cachedApi.getItem(asin);

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return only necessary fields (sanitize response)
    return new Response(
      JSON.stringify({
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: product.images.primary,
        features: product.features.slice(0, 5), // Limit features
        url: product.url
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // 1 hour browser cache
        } 
      }
    );

  } catch (error) {
    console.error('Amazon API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch product',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
