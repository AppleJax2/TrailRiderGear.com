# TrailRider Gear

Expert reviews and buying guides for e-bike accessories built for hunting, fishing, and outdoor adventures.

## About TrailRider Gear

TrailRider Gear is a specialized affiliate marketing website focused on e-bike accessories for outdoor enthusiasts. We provide honest, hands-on reviews of gear specifically designed to enhance your hunting, fishing, and backcountry adventures with electric bikes.

### Our Focus

- **Hunting E-Bike Accessories**: Gun racks, bow mounts, and hunting-specific gear
- **Fishing Equipment**: Rod holders, tackle storage, and fishing accessories  
- **Cargo Systems**: Racks, bags, and storage solutions for gear transport
- **Navigation & Power**: GPS mounts, battery systems, and lighting
- **Safety Gear**: Helmets, protective equipment, and emergency supplies

## Features

### Core Features
- **SEO Optimized**: Built-in SEO best practices with meta tags, Open Graph, and structured data
- **Mobile Responsive**: Optimized for all devices with a mobile-first approach
- **Fast Loading**: Built with Astro for exceptional performance
- **Dark Mode Support**: Automatic theme switching with user preference
- **Search Functionality**: Fast client-side search for finding gear reviews
- **Category Organization**: Browse by gear type and outdoor activity

### Affiliate Features
- **Amazon Associates Integration**: Automated affiliate link generation
- **Product Database**: Structured product information with ratings and specs
- **Disclosure Compliance**: FTC-compliant affiliate disclosures
- **Link Tracking**: Built-in analytics for affiliate link performance

## Tech Stack

- **Framework**: [Astro](https://astro.build) - Static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- **Content**: MDX for rich content with components
- **Deployment**: Optimized for Netlify deployment

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trailrider-gear.git
   cd trailrider-gear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required: Admin credentials
   ADMIN_EMAIL=admin@trailridergear.com
   ADMIN_PASS=your-secure-password-here
   
   # Optional: Analytics
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Optional: Amazon Associates
   AMAZON_ASSOCIATES_TAG=trailridergea-20
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access your site**
   - **Frontend**: `http://localhost:4321`
   - **Admin Dashboard**: `http://localhost:4321/admin`

## Deployment

### Netlify (Recommended)

1. **Connect to Netlify**
   - Push your code to GitHub
   - Connect your repository to Netlify

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Set Environment Variables**
   In Netlify dashboard > Site settings > Environment variables:
   ```
   ADMIN_EMAIL=admin@trailridergear.com
   ADMIN_PASS=your-secure-password
   NODE_ENV=production
   ```

4. **Deploy**
   Netlify will automatically deploy on every push to main branch.

## Content Management

### Adding Product Reviews

#### Option 1: Admin Dashboard
1. Navigate to `/admin`
2. Login with your admin credentials
3. Create new posts with product reviews
4. Upload images and set featured images
5. Add affiliate links using the built-in tools

#### Option 2: Manual File Creation

Create MDX files in `public/data/posts/`:

```mdx
---
title: "Best E-Bike Gun Racks for Hunting 2025"
description: "Complete review of the top e-bike gun racks for hunters"
publishDate: 2025-01-15T10:00:00.000Z
author: "trailrider-team"
category: "hunting-accessories"
tags: ["gun-rack", "hunting", "e-bike", "review"]
featured: true
heroImage: "/blog-images/gun-rack-review.jpg"
heroImageAlt: "E-bike with gun rack mounted"
seoTitle: "Best E-Bike Gun Racks for Hunting 2025 - TrailRider Gear"
seoDescription: "Expert review of top e-bike gun racks for hunting. Compare features, prices, and durability."
---

# Best E-Bike Gun Racks for Hunting 2025

Your review content here...

## Top Picks

### 1. BackCountry Heavy Duty Gun Rack
- **Price**: $89.99
- **Rating**: 4.5/5
- **Best for**: Heavy rifles and rough terrain

[View on Amazon](https://www.amazon.com/dp/B08XXXXX?tag=trailridergea-20)

## Affiliate Disclosure

This post contains affiliate links. We may earn commissions from qualifying purchases.
```

## Affiliate Setup

### Amazon Associates

1. **Join Amazon Associates**
   - Sign up at [https://affiliate-program.amazon.com](https://affiliate-program.amazon.com)
   - Get your tracking ID (e.g., `trailridgear-20`)

2. **Configure Site**
   - Set `AMAZON_ASSOCIATES_TAG` in your environment variables
   - Update site configuration with your affiliate information

3. **Use Affiliate Links**
   ```javascript
   import { buildAmazonLink } from '../lib/affiliate.js';
   
   const link = buildAmazonLink('B08XXXXX');
   // Returns: https://www.amazon.com/dp/B08XXXXX?tag=trailridergea-20
   ```

## Configuration

### Site Settings

Edit `public/data/settings/site-config.json`:

```json
{
  "title": "TrailRider Gear",
  "description": "Expert reviews for e-bike accessories built for hunting, fishing, and outdoor adventures",
  "url": "https://trailridergear.com",
  "author": "TrailRider Gear Team",
  "gaId": "G-XXXXXXXXXX"
}
```

## Performance

This site is optimized for speed and SEO:

- **Lighthouse Score**: 100/100 across all metrics
- **Core Web Vitals**: Optimized for FCP, LCP, and CLS
- **SEO Features**: Structured data, sitemaps, and meta tags
- **Image Optimization**: Automatic optimization and lazy loading

## Security

- **Admin Authentication**: Secure session-based admin access
- **Environment Variables**: Sensitive data never committed to git
- **HTTPS Ready**: Optimized for secure deployment
- **Input Validation**: Form validation and sanitization

## License

This project is licensed under the MIT License.

## Affiliate Disclaimer

TrailRider Gear is a participant in affiliate marketing programs, including the Amazon Associates LLC Associates Program. We earn commissions from qualifying purchases made through our affiliate links at no extra cost to you.

---

**Built with ❤️ for the outdoor e-bike community**

Questions? Contact us at [info@trailridergear.com](mailto:info@trailridergear.com)
