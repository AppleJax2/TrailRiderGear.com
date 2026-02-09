# Amazon Creators API Integration for TrailRiderGear

## Overview
Node.js REST client for Amazon Creators API to fetch real product images and data.

## Prerequisites
- Amazon Associates account (approved with 3+ sales)
- Creators API credentials (Credential ID + Secret)
- Node.js 18+ (for native fetch)

## Setup

### 1. Get Credentials
1. Apply at https://affiliate-program.amazon.com/
2. Generate 3 sales within 180 days
3. Access Creators API portal
4. Create new credentials → Get `CREDENTIAL_ID` and `CREDENTIAL_SECRET`

### 2. Environment Variables
Create `.env` file in project root:
```
AMAZON_CREDENTIAL_ID=your_credential_id_here
AMAZON_CREDENTIAL_SECRET=your_credential_secret_here
AMAZON_PARTNER_TAG=trailridergea-20
AMAZON_MARKETPLACE=www.amazon.com
```

### 3. Usage

```javascript
import { AmazonCreatorsAPI } from './src/lib/amazon-creators-api.js';

// Initialize
const amazonAPI = new AmazonCreatorsAPI({
  credentialId: process.env.AMAZON_CREDENTIAL_ID,
  credentialSecret: process.env.AMAZON_CREDENTIAL_SECRET,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  marketplace: process.env.AMAZON_MARKETPLACE
});

// Fetch product by ASIN
const product = await amazonAPI.getItem('B07Z5GB3L7');

// Get product images
const images = product.images.primary.large.url;
```

## API Operations

### getItem(asin)
Retrieves product details including images, pricing, title.

### searchItems(keywords, options)
Search for products by keywords.

### getVariations(asin)
Get all variants of a product (sizes, colors).

## Caching Requirements
Per Amazon terms:
- Cache product data for 24 hours minimum
- Images can be cached but must refresh every 24 hours
- Prices must be real-time or cached < 1 hour

## File Structure
```
src/
  lib/
    amazon-creators-api.js      # Core API client
    amazon-cache.js             # 24-hour caching layer
  api/
    products/
      [asin].js                 # Astro API endpoint for product data
```

## Rate Limits
- 1 request per second per IP
- 10,000 requests per day per account
- Cache aggressively to stay under limits

## Next Steps After Approval
1. Add real ASINs from your CSV to blog posts
2. Update ProductCard to fetch images dynamically
3. Build image CDN with 24-hour cache
