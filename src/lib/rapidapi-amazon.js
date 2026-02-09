// src/lib/rapidapi-amazon.js
// RapidAPI Axesso Amazon Data Service client
// Gets real Amazon product data without official API approval

/**
 * RapidAPI Axesso Amazon Client
 * Fetches product data via RapidAPI (scrapes Amazon)
 */
export class RapidAPIAmazonClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://axesso-axesso-amazon-data-service-v1.p.rapidapi.com';
  }

  /**
   * Fetch product details by ASIN or URL
   * Endpoint: GET /amz/amazon-lookup-product
   */
  async getProduct(asin, options = {}) {
    const url = new URL(`${this.baseUrl}/amz/amazon-lookup-product`);
    
    // Build full Amazon URL from ASIN
    const amazonUrl = asin.startsWith('http') 
      ? asin 
      : `https://www.amazon.com/dp/${asin}`;
    
    url.searchParams.append('url', amazonUrl);
    url.searchParams.append('domainCode', options.domain || 'com');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RapidAPI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.normalizeProduct(data);
  }

  /**
   * Search Amazon products
   * Endpoint: GET /amz/amazon-search-by-keyword-asin
   */
  async searchProducts(keyword, options = {}) {
    const url = new URL(`${this.baseUrl}/amz/amazon-search-by-keyword-asin`);
    
    url.searchParams.append('keyword', keyword);
    url.searchParams.append('page', options.page || '1');
    url.searchParams.append('domainCode', options.domain || 'com');
    
    if (options.sort) {
      url.searchParams.append('sortBy', options.sort); // relevance, price-asc, price-desc, review-rank
    }
    if (options.category) {
      url.searchParams.append('productType', options.category);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RapidAPI search error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.searchProductDetails?.map(item => this.normalizeSearchResult(item)) || [];
  }

  /**
   * Get product reviews
   * Endpoint: GET /amz/amazon-product-reviews
   */
  async getReviews(asin, options = {}) {
    const url = new URL(`${this.baseUrl}/amz/amazon-product-reviews`);
    
    url.searchParams.append('asin', asin);
    url.searchParams.append('page', options.page || '1');
    url.searchParams.append('domainCode', options.domain || 'com');
    url.searchParams.append('sortBy', options.sort || 'recent'); // recent, helpful

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'axesso-axesso-amazon-data-service-v1.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RapidAPI reviews error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Normalize API response to our product format
   * Real Axesso response fields verified 2026-02-08 via curl:
   *   productTitle, manufacturer, price, retailPrice, productRating (string),
   *   countReview, mainImage.imageUrl, imageUrlList[], features[] (strings),
   *   warehouseAvailability, responseStatus, asin, productDescription
   */
  normalizeProduct(data) {
    if (!data) return null;

    const product = Array.isArray(data) ? data[0] : data;
    if (!product || product.responseStatus !== 'PRODUCT_FOUND_RESPONSE') return null;

    // mainImage.imageUrl is a real field (verified)
    const mainImage = product.mainImage?.imageUrl || null;

    // price and retailPrice are top-level numbers (not nested in buyBox)
    const priceNum = product.price > 0 ? product.price : (product.retailPrice > 0 ? product.retailPrice : 0);
    const price = priceNum > 0 ? `$${priceNum}` : 'Price unavailable';

    // productRating is a string like "4.5 out of 5 stars" (not nested in reviewInsights)
    let rating = 0;
    if (product.productRating) {
      const m = product.productRating.match(/(\d\.?\d?)\s*out of/);
      if (m) rating = parseFloat(m[1]);
    }

    // countReview is a top-level number (not globalReviews.length)
    const reviewCount = product.countReview || 0;

    // features is a top-level string array (not aboutProduct objects)
    const features = product.features || [];

    // manufacturer has prefixes like "Brand: " or "Visit the X Store"
    let brand = product.manufacturer || '';
    brand = brand.replace(/^Brand:\s*/i, '').replace(/^Visit the\s*/i, '').replace(/\s*Store$/i, '').trim();

    return {
      asin: product.asin,
      title: product.productTitle || 'Unknown Product',
      brand,
      description: product.productDescription || '',
      images: {
        primary: mainImage,
        variants: (product.imageUrlList || []).slice(0, 5)
      },
      price,
      currency: 'USD',
      rating,
      reviewCount,
      features: features.slice(0, 5),
      availability: product.warehouseAvailability || '',
      url: `https://www.amazon.com/dp/${product.asin}`,
      raw: product
    };
  }

  /**
   * Normalize search result item
   */
  normalizeSearchResult(item) {
    return {
      asin: item.asin,
      title: item.productDescription || '',
      price: item.price || '',
      rating: item.productRating || 0,
      reviewCount: item.productReviewCount || 0,
      image: item.productImage || '',
      url: item.productUrl || `https://www.amazon.com/dp/${item.asin}`
    };
  }
}

/**
 * Cached wrapper with 6-hour cache (RapidAPI has rate limits)
 */
export class CachedRapidAPIClient {
  constructor(apiClient, cacheDuration = 6 * 60 * 60 * 1000) {
    this.api = apiClient;
    this.cache = new Map();
    this.cacheDuration = cacheDuration; // 6 hours default
  }

  async getProduct(asin) {
    const cacheKey = `product_${asin}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const fresh = await this.api.getProduct(asin);
    this.cache.set(cacheKey, { data: fresh, timestamp: Date.now() });
    return fresh;
  }

  async searchProducts(keyword, options) {
    const cacheKey = `search_${keyword}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const fresh = await this.api.searchProducts(keyword, options);
    this.cache.set(cacheKey, { data: fresh, timestamp: Date.now() });
    return fresh;
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Quick helper for single product fetch
 */
export async function fetchAmazonProductRapidAPI(asin, apiKey) {
  const client = new RapidAPIAmazonClient({ apiKey });
  const cached = new CachedRapidAPIClient(client);
  return cached.getProduct(asin);
}
