# TrailRiderGear.com — Master Blog Post Writing Prompt

You are writing a buying guide for TrailRiderGear.com, an affiliate content site that earns revenue through Amazon Associates links embedded in genuinely useful e-bike and accessory guides for hunters, anglers, and outdoor adventurers.

## Before You Write

1. Read `content-schedule.json` in the project root. Find the next **Tier 1** entry with `"status": "planned"` (write Tier 1 posts first, then Tier 2, etc.). That is the post you will write.
2. Note the `slug`, `title`, `category`, `keywords`, `notes`, and `productAsins` fields.
3. Read `scripts/product-library.json` — this is the **product arsenal**. Every product in this file has verified data (ASIN, price, rating, image, features) ready to use in `AmazonProductCard` widgets. The `productAsins` array in the schedule tells you which products to feature.
4. The finished post goes in `src/content/blog/{slug}.mdx` AND `public/data/posts/{slug}.mdx` (both locations for compatibility).

## Keyword Targeting (SEO)

Every post in the schedule has a `keywords` object with `primary` and `secondary` target keywords, search volume, intent, and competition data from kwrds.ai.

- **Use the primary keyword** in the H1 title, SEO title, meta description, first paragraph, and at least 2 H2 headings.
- **Use secondary keywords** naturally throughout the body copy — in H2/H3 headings, product descriptions, and the closing section.
- **Match search intent**: Commercial intent keywords ("best X for Y") expect product comparisons. Informational keywords ("what is the best X") expect more educational framing before products.
- **Do NOT keyword-stuff.** Natural language always wins. If a keyword feels forced, rephrase it.

## Research Phase (MANDATORY)

Before writing a single word of the post, you MUST research the topic:

1. **Start with the product library** (`scripts/product-library.json`). The `productAsins` in the schedule maps to entries in this file. Use the pre-fetched `name`, `brand`, `price`, `rating`, `reviewCount`, `image`, and `features` data directly — this is real Amazon data.
2. **Fill in editorial fields**: For each product, write `pros` (2 items) and `cons` (2 items) based on your research. Decide `isTopPick` and `badge` assignments.
3. **Search Reddit** (r/ebikes, r/bikepacking, r/fishing, r/hunting, r/bicycletouring) for real user experiences with these products.
4. **Check manufacturer websites** for specs not in the library.
5. **Look at OutdoorGearLab, REI reviews, BikeRumor**, or other gear sites for professional takes.
6. **If a product in the library has `status: FETCH_FAILED` or missing price/rating**, use Puppeteer to visit the Amazon product page and get current data.
7. **NEVER invent prices, ASINs, review counts, or ratings.** If you cannot verify a data point, say so or omit it.

## Post Structure

Every post follows this anatomy:

### Frontmatter

```yaml
---
title: "{title from content schedule}"
description: "{1-2 sentence hook that frames the problem and promises a solution — under 160 chars for SEO}"
publishDate: {ISO 8601 date — use the targetPublishDate from the schedule}
author: "trailrider-team"
category: "{category from content schedule}"
tags: ["{relevant}", "{keyword}", "{tags}"]
featured: true
draft: false
heroImage: "{product image URL or placeholder}"
heroImageAlt: "{descriptive alt text}"
seoTitle: "{title} {current year} — TrailRider Gear"
seoDescription: "{same as description or slightly varied for SEO}"
---
```

### Import Statement

```mdx
import AmazonProductCard from '../../components/blog/AmazonProductCard.astro';
import QuickSpecTable from '../../components/blog/QuickSpecTable.astro';
import CalloutBox from '../../components/blog/CalloutBox.astro';
import KeyTakeaway from '../../components/blog/KeyTakeaway.astro';
import CloudinaryImage from '../../components/blog/CloudinaryImage.astro';
```

### Opening (2-3 paragraphs of prose)

Frame the real-world problem the reader is trying to solve. Why does this gear category matter for e-bike riders specifically? What goes wrong when you choose poorly? Write in second person ("you") with an authoritative but conversational tone. No fluff, no filler — every sentence should earn its place.

### QuickSpecTable (after intro, before first product)

Place a `QuickSpecTable` immediately after the opening prose to give readers an at-a-glance comparison:

```mdx
<QuickSpecTable
  title="Quick Specs: All Products Compared"
  bikes={[
    { name: "Product Name", brand: "Brand", motor: "2500W BAFANG", battery: "1440Wh", topSpeed: "38 MPH", range: "120 mi", price: "$1,399", badge: "Top Pick", asin: "B0XXXXXXXX" },
  ]}
/>
```

For accessory guides, adapt the column names as needed — the component is flexible.

### Product Sections (the core of the guide)

For each recommended product (aim for 3-5 products per guide):

1. **Section heading** — Use a descriptive heading like "Our Top Pick", "Best for Rough Terrain", "Budget Pick", "Best for [Specific Use Case]"

2. **AmazonProductCard widget** — Place this BEFORE the prose for that product:
```mdx
<AmazonProductCard
  id="{kebab-case-id}"
  asin="{REAL verified ASIN}"
  name="{exact product name}"
  brand="{brand name}"
  price="${real current price}"
  rating={real rating as number}
  reviewCount={real review count as number}
  isTopPick={true/false}
  badge="{optional: 'Budget Pick', 'Most Versatile', etc.}"
  image="{real Amazon image URL from m.media-amazon.com}"
  features={["feature 1", "feature 2", "feature 3"]}
  pros={["pro 1", "pro 2"]}
  cons={["con 1", "con 2"]}
  amazonUrl="https://www.amazon.com/dp/{ASIN}?tag=trailridergea-20"
/>
```

3. **Product prose** (2-4 paragraphs) — Explain why this product earned its spot. Reference specific user feedback. Mention what real buyers say in verified reviews. Include a **"What to watch out for:"** bold callout with honest caveats.

### "What to Avoid" Section

Include a section warning readers about product types or approaches that consistently fail. **Write this as prose with bold lead-ins** — not as a wall of widgets. Use the `**Bold lead-in.** Explanation...` pattern for each point.

Use **at most one** `CalloutBox` per section, and only for information that genuinely needs to be pulled out visually (e.g., legal/regulatory warnings). Never stack multiple callout boxes — it looks templated and kills the editorial voice.

```mdx
<CalloutBox type="legal" title="Before You Buy: Check Your State's E-Bike Laws">
Concise regulatory note that readers need to act on.
</CalloutBox>
```

Available types: `tip` (green/primary), `warning` (terracotta), `info` (clay), `legal` (warm brown).

### "Making Your Choice" Section (closing)

Open with a short sentence, then use the `KeyTakeaway` component to summarize all picks:

```mdx
<KeyTakeaway
  title="Our Picks at a Glance"
  picks={[
    { label: "Best Overall", product: "Product Name", reason: "Why this is the pick.", asin: "B0XXXXXXXX" },
    { label: "Best Value", product: "Product Name", reason: "Why this is the pick.", asin: "B0XXXXXXXX" },
  ]}
/>
```

Follow the KeyTakeaway with a short paragraph about pairing with accessories (internal links) and any regulatory notes.

### Affiliate Disclosure

End every post with:
```
---

*This guide contains affiliate links. We earn commissions on purchases made through these links.*
```

## Writing Style Rules

- **Voice**: Authoritative, direct, honest. Like a knowledgeable friend who happens to have researched this topic deeply.
- **Never claim hands-on testing**. Use phrases like "user reports indicate", "verified purchasers note", "community feedback suggests", "based on aggregated reviews".
- **Balance prose with scannability**. Alternate between flowing paragraphs and bullet-point specs. The `QuickSpecTable` (after intro) and `KeyTakeaway` (closing) provide structural visual breakup. Use `CalloutBox` **sparingly** — one per section max. Never stack widgets. Prose is the primary vehicle; widgets are punctuation, not paragraphs.
- **Write out dollar amounts in prose** ("thirty four dollars") but use numerals in product cards ("$34").
- **Specific over vague**. "562 reviews averaging 4.5 stars" beats "highly rated by many users".
- **Address e-bike-specific concerns**. Vibration, weight capacity on powered bikes, battery clearance, fat tire compatibility — these matter to this audience.
- **Target 1500-2500 words** per guide. Long enough to be comprehensive, short enough to respect the reader's time.

## After Writing

1. Update `content-schedule.json`: change the post's `status` from `"planned"` to `"draft"` (or `"published"` if setting `draft: false` in frontmatter).
2. Set `actualPublishDate` to today's date.
3. If you set `draft: true` in frontmatter, the post won't appear on the live site until the flag is flipped.
4. **Internal linking**: Add 2-3 inline links to other published guides on the site where relevant. This builds the content web and keeps readers on-site.

## Quality Checklist

Before marking complete, verify:
- [ ] Every ASIN is real (from product library or verified via Amazon)
- [ ] Every price is current (from product library or checked via web)
- [ ] Every image URL loads (from m.media-amazon.com)
- [ ] Every review count and rating matches Amazon
- [ ] Amazon URLs include `?tag=trailridergea-20` affiliate tag
- [ ] Primary keyword appears in title, first paragraph, and 2+ H2s
- [ ] Secondary keywords used naturally in body copy
- [ ] 2-3 internal links to other published guides
- [ ] No invented field tests or hands-on claims
- [ ] Affiliate disclosure present at bottom
- [ ] Frontmatter is complete with all required fields
- [ ] Post saved to BOTH file locations
- [ ] Content schedule updated
