// src/lib/amazon-creators-api.js
// Node.js REST client for Amazon Creators API
// Fetches real product images and data for TrailRiderGear

/**
 * Amazon Creators API Client
 * Handles OAuth 2.0 authentication and API calls
 */
export class AmazonCreatorsAPI {
  constructor(config) {
    this.credentialId = config.credentialId;
    this.credentialSecret = config.credentialSecret;
    this.partnerTag = config.partnerTag || 'trailridergea-20';
    this.marketplace = config.marketplace || 'www.amazon.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth 2.0 access token
   * Tokens valid for ~1 hour, cache and reuse
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const authUrl = 'https://api.amazon.com/auth/token';
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentialId,
        client_secret: this.credentialSecret,
        scope: 'product_advertising'
      })
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiration for safety
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    
    return this.accessToken;
  }

  /**
   * Get single product by ASIN
   * Returns: { title, images, price, features, rating, url }
   */
  async getItem(asin, options = {}) {
    const token = await this.getAccessToken();
    
    const url = `https://webservices.amazon.com/paapi5/searchitems`;
    
    const body = {
      itemIds: [asin],
      itemIdType: 'ASIN',
      resources: [
        'Images.Primary.Large',
        'Images.Variants.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating'
      ],
      partnerTag: this.partnerTag,
      marketplace: this.marketplace,
      ...options
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Api-Version': '2024-03-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeProduct(data.itemsResult?.items?.[0]);
  }

  /**
   * Search for products by keywords
   */
  async searchItems(keywords, options = {}) {
    const token = await this.getAccessToken();
    
    const url = `https://webservices.amazon.com/paapi5/searchitems`;
    
    const body = {
      keywords,
      searchIndex: options.category || 'All',
      itemCount: options.limit || 10,
      resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating'
      ],
      partnerTag: this.partnerTag,
      marketplace: this.marketplace
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Api-Version': '2024-03-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.searchResult?.items?.map(item => this.normalizeProduct(item)) || [];
  }

  /**
   * Normalize Amazon API response to our product format
   */
  normalizeProduct(amazonItem) {
    if (!amazonItem) return null;

    const itemInfo = amazonItem.itemInfo || {};
    const images = amazonItem.images || {};
    const offers = amazonItem.offers || {};
    const reviews = amazonItem.customerReviews || {};

    return {
      asin: amazonItem.asin,
      title: itemInfo.title?.displayValue || 'Unknown Product',
      brand: itemInfo.byLineInfo?.brand?.displayValue || '',
      images: {
        primary: images.primary?.large?.url || null,
        variants: images.variants?.map(v => v.large?.url) || []
      },
      price: offers.listings?.[0]?.price?.displayAmount || 'Price unavailable',
      currency: offers.listings?.[0]?.price?.currency || 'USD',
      rating: reviews.starRating?.value || 0,
      reviewCount: reviews.totalReviewCount || 0,
      features: itemInfo.features?.displayValues || [],
      url: `https://www.amazon.com/dp/${amazonItem.asin}?tag=${this.partnerTag}`,
      raw: amazonItem // Keep raw for debugging
    };
  }
}

/**
 * Cached API wrapper with 24-hour cache
 * Per Amazon terms: product data can be cached 24 hours
 */
export class CachedAmazonAPI {
  constructor(apiClient, cacheDir = './.cache/amazon') {
    this.api = apiClient;
    this.cacheDir = cacheDir;
    this.memoryCache = new Map();
  }

  /**
   * Get cached item or fetch fresh
   */
  async getItem(asin) {
    const cacheKey = `item_${asin}`;
    const cached = this.getCache(cacheKey);
    
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.data;
    }

    const fresh = await this.api.getItem(asin);
    this.setCache(cacheKey, fresh);
    return fresh;
  }

  /**
   * Cache helpers
   */
  getCache(key) {
    return this.memoryCache.get(key);
  }

  setCache(key, data) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  isExpired(timestamp) {
    // 24 hours in milliseconds
    const CACHE_TTL = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > CACHE_TTL;
  }

  /**
   * Clear expired cache entries
   */
  clearExpired() {
    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry.timestamp)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

/**
 * Quick helper for single product fetch
 */
export async function fetchAmazonProduct(asin, config) {
  const api = new AmazonCreatorsAPI(config);
  const cached = new CachedAmazonAPI(api);
  return cached.getItem(asin);
}
