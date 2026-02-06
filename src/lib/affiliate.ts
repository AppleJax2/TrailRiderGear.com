/**
 * Affiliate Link Management Utility
 * Handles Amazon Associates and other affiliate links with proper tracking
 */

// Default Amazon Associates tag from environment or fallback
const DEFAULT_AMAZON_TAG = process.env.AMAZON_ASSOCIATES_TAG || 'trailridgear-20';

/**
 * Build an Amazon Associates link with tracking
 * @param asin - Amazon product ASIN
 * @param tag - Associates tag (defaults to env variable)
 * @param keywords - Optional keywords for search links
 * @returns Full Amazon URL with tracking
 */
export function buildAmazonLink(
  asin?: string,
  tag: string = DEFAULT_AMAZON_TAG,
  keywords?: string
): string {
  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  }
  if (keywords) {
    const encodedKeywords = encodeURIComponent(keywords);
    return `https://www.amazon.com/s?k=${encodedKeywords}&tag=${tag}`;
  }
  return `https://www.amazon.com?tag=${tag}`;
}

/**
 * Build Amazon link with additional campaign tracking
 * @param asin - Product ASIN
 * @param campaign - Campaign name for tracking (e.g., 'hunting-gear-guide')
 * @param tag - Associates tag
 */
export function buildTrackedAmazonLink(
  asin: string,
  campaign: string,
  tag: string = DEFAULT_AMAZON_TAG
): string {
  return `https://www.amazon.com/dp/${asin}?tag=${tag}&linkCode=ll1&camp=${campaign}`;
}

/**
 * Affiliate product data structure
 */
export interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  asin?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  features: string[];
  pros: string[];
  cons: string[];
  amazonUrl?: string;
  alternativeUrls?: {
    walmart?: string;
    rei?: string;
    manufacturer?: string;
  };
}

/**
 * Get affiliate link with proper attributes
 * Returns object with URL and recommended link attributes
 */
export function getAffiliateLink(
  product: AffiliateProduct,
  source: 'amazon' | 'walmart' | 'rei' | 'manufacturer' = 'amazon'
): { url: string; rel: string; target: string; title: string } {
  let url: string;

  switch (source) {
    case 'amazon':
      url = product.amazonUrl || (product.asin ? buildAmazonLink(product.asin) : '#');
      break;
    case 'walmart':
      url = product.alternativeUrls?.walmart || '#';
      break;
    case 'rei':
      url = product.alternativeUrls?.rei || '#';
      break;
    case 'manufacturer':
      url = product.alternativeUrls?.manufacturer || '#';
      break;
    default:
      url = '#';
  }

  return {
    url,
    rel: 'nofollow sponsored',
    target: '_blank',
    title: `Check price for ${product.name} on ${source.charAt(0).toUpperCase() + source.slice(1)}`,
  };
}

/**
 * Sample products for development/testing
 * Replace with actual product database
 */
export const sampleProducts: AffiliateProduct[] = [
  {
    id: 'hunting-rack-001',
    name: 'Heavy Duty E-Bike Gun Rack',
    brand: 'BackCountry',
    category: 'Hunting Accessories',
    asin: 'B08XXXXX',
    price: '$89.99',
    rating: 4.5,
    reviewCount: 127,
    imageUrl: '/products/gun-rack.jpg',
    features: [
      'Quick-release mounting system',
      'Fits most e-bike handlebars',
      'Rubber-coated to prevent scratches',
      'Holds rifles up to 50 lbs',
    ],
    pros: ['Easy to install', 'Very secure', 'Good padding'],
    cons: ['Heavy', 'Expensive'],
  },
  {
    id: 'rod-holder-001',
    name: 'Dual Fishing Rod Holder for E-Bikes',
    brand: 'AnglerPro',
    category: 'Fishing Accessories',
    asin: 'B09XXXXX',
    price: '$45.99',
    rating: 4.3,
    reviewCount: 89,
    imageUrl: '/products/rod-holder.jpg',
    features: [
      'Holds 2 rods securely',
      '360-degree rotation',
      'Quick-detach for transport',
      'Universal mounting bracket',
    ],
    pros: ['Holds rods securely', 'Easy to access', 'Good value'],
    cons: ['Can wobble on rough terrain'],
  },
];

/**
 * Get product by ID
 */
export function getProductById(id: string): AffiliateProduct | undefined {
  return sampleProducts.find((p) => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): AffiliateProduct[] {
  return sampleProducts.filter((p) => p.category === category);
}
