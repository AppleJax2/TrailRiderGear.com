# Amazon Product Images - Two Options

## Option 1: RapidAPI Axesso (Recommended for Quick Start)
**No approval needed. Works immediately.**

### Setup
1. Sign up at https://rapidapi.com/axesso/api/axesso-amazon-data-service1
2. Subscribe to the API (free tier: 100 requests/month)
3. Copy your RapidAPI key from the dashboard
4. Add to `.env`:
   ```
   RAPIDAPI_KEY=your_rapidapi_key_here
   ```

### Usage
```javascript
// Fetch product via RapidAPI
const response = await fetch('/api/products/rapidapi/B07Z5GB3L7');
const product = await response.json();

// Returns:
// {
//   asin: "B07Z5GB3L7",
//   title: "AteamProducts Bike Fishing Rod Holder",
//   price: "$35.99",
//   rating: 4.2,
//   reviewCount: 203,
//   image: "https://m.media-amazon.com/images/...",
//   url: "https://www.amazon.com/dp/B07Z5GB3L7?tag=trailridergea-20"
// }
```

### Pricing
- Free: 100 requests/month
- Basic: $15/month - 5,000 requests
- Pro: $45/month - 25,000 requests

### Limitations
- Data may be 1-2 hours delayed from Amazon
- Rate limits apply
- Scraped data (not official API)

---

## Option 2: Official Amazon Creators API
**Requires Associates approval. Real-time data.**

### Setup
1. Apply at https://affiliate-program.amazon.com/
2. Generate 3 sales within 180 days
3. Get Creators API credentials
4. Add to `.env`:
   ```
   AMAZON_CREDENTIAL_ID=your_id
   AMAZON_CREDENTIAL_SECRET=your_secret
   AMAZON_PARTNER_TAG=trailridergea-20
   ```

### Usage
```javascript
const response = await fetch('/api/products/B07Z5GB3L7');
const product = await response.json();
```

### Benefits
- Real-time prices and availability
- Official Amazon data
- Higher rate limits
- Required for high-traffic sites

---

## Component Usage

Use `AmazonProductCard` with `fetchLiveData=true`:

```astro
<AmazonProductCard
  asin="B07Z5GB3L7"
  isTopPick={true}
  fetchLiveData={true}
  pros={["Works on multiple bikes", "No tools required"]}
  cons={["Straps may loosen on rough terrain"]}
/>
```

The card will:
1. Fetch real product image from RapidAPI
2. Display current price and rating
3. Show availability status
4. Link to Amazon with your affiliate tag

---

## Recommendation

**Start with RapidAPI** for immediate results. It gets you real product images within minutes.

**Switch to official API** once you have Associates approval and higher traffic volumes.
