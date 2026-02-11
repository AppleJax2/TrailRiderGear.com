# EBikeFieldGuide.com — Widget Bank

Quick reference for all blog post components. Use this when integrating widgets into a new or existing post.

---

## Rules

1. **Prose is the primary vehicle.** Widgets are punctuation, not paragraphs.
2. **Never stack widgets.** Two components back-to-back looks templated. Always have prose between them.
3. **One CalloutBox per section max.** Only use it when the content genuinely needs to be pulled out (legal warnings, safety notes).
4. **Every post gets a KeyTakeaway** in the "Making Your Choice" section. No exceptions.
5. **E-bike posts get a QuickSpecTable** after the intro. Accessory posts skip it unless comparing 4+ products with numeric specs.

---

## Components

### KeyTakeaway
**Use in:** Every post's "Making Your Choice" section.
**Import:** `import KeyTakeaway from '../../components/blog/KeyTakeaway.astro';`

```mdx
<KeyTakeaway
  picks={[
    { label: "Best Overall", product: "Product Name", reason: "One sentence why.", asin: "B0XXXXXXXX" },
    { label: "Best Value", product: "Product Name", reason: "One sentence why.", asin: "B0XXXXXXXX" },
  ]}
/>
```

**Props:** `picks` — array of `{ label, product, reason, asin? }`. First item gets the green highlighted row.
**Style:** Rounded card stack. Green top row for #1 pick, muted surface rows for the rest. Labels are uppercase small text in left column.

---

### QuickSpecTable
**Use in:** E-bike posts only, after the intro paragraphs, before the first product section.
**Import:** `import QuickSpecTable from '../../components/blog/QuickSpecTable.astro';`

```mdx
<QuickSpecTable
  title="Quick Specs: All 5 Bikes Compared"
  bikes={[
    { name: "Model", brand: "Brand", motor: "2500W BAFANG", battery: "1440Wh (48V 30Ah)", topSpeed: "38 MPH", range: "Up to 120 mi", price: "$1,399", badge: "Top Pick", asin: "B0XXXXXXXX" },
  ]}
/>
```

**Props:** `title` (string), `bikes` — array of `{ name, brand, motor, battery, topSpeed, range, price, badge?, asin? }`.
**Style:** Desktop table with header row + mobile card stack. Badges are small colored pills. Links to Amazon via asin.

---

### CalloutBox
**Use in:** Sparingly. One per section max. Best for legal/regulatory warnings or a single critical tip.
**Import:** `import CalloutBox from '../../components/blog/CalloutBox.astro';`

```mdx
<CalloutBox type="legal" title="Before You Buy: Check Your State's E-Bike Laws">
Concise note the reader needs to act on. Use **bold** for key terms.
</CalloutBox>
```

**Types:**
| Type | Color | Use for |
|------|-------|---------|
| `tip` | Green (primary) | Practical advice worth highlighting |
| `warning` | Terracotta | Mistakes to avoid, safety concerns |
| `info` | Clay | Useful context, not critical |
| `legal` | Warm brown | Regulations, legal requirements |

**Props:** `type` (default: `info`), `title` (optional). Content goes in the slot.

---

### CloudinaryImage
**Use in:** When you have a relevant image URL to break up a long text section.
**Import:** `import CloudinaryImage from '../../components/blog/CloudinaryImage.astro';`

```mdx
<CloudinaryImage
  src="https://m.media-amazon.com/images/I/example.jpg"
  alt="Descriptive alt text"
  width={800}
  caption="Optional caption text"
/>
```

**Props:** `src` (URL or Cloudinary path), `alt`, `width` (default 800), `height?`, `caption?`, `loading` (default `lazy`), `sizes?`.
**Style:** Responsive with auto srcset via Cloudinary CDN. Lazy loaded with blur placeholder.

---

### AmazonProductCard
**Use in:** Every product section, placed before the editorial prose for that product.
**Import:** `import AmazonProductCard from '../../components/blog/AmazonProductCard.astro';`

```mdx
<AmazonProductCard
  id="kebab-case-id"
  asin="B0XXXXXXXX"
  name="Exact Product Name"
  brand="Brand"
  price="$XX"
  rating={4.5}
  reviewCount={100}
  isTopPick={true}
  badge="Budget Pick"
  image="https://m.media-amazon.com/images/I/xxxxx.jpg"
  features={["feature 1", "feature 2", "feature 3"]}
  pros={["pro 1", "pro 2"]}
  cons={["con 1", "con 2"]}
  amazonUrl="https://www.amazon.com/dp/B0XXXXXXXX?tag=trailridergea-20"
/>
```

---

### ProductComparisonTable
**Use in:** Accessory posts with 3+ products that have comparable specs (capacity, weight, mount type, etc.).
**Import:** `import ProductComparisonTable from '../../components/blog/ProductComparisonTable.astro';`

Already used in the waterproof panniers guide. Good for side-by-side spec comparisons of accessories.

---

## Standard Import Block

Copy this into every new post and remove unused imports:

```mdx
import AmazonProductCard from '../../components/blog/AmazonProductCard.astro';
import KeyTakeaway from '../../components/blog/KeyTakeaway.astro';
import QuickSpecTable from '../../components/blog/QuickSpecTable.astro';
import CalloutBox from '../../components/blog/CalloutBox.astro';
import CloudinaryImage from '../../components/blog/CloudinaryImage.astro';
```

---

## Visual Rhythm Checklist

Before marking a post complete, verify this flow:

- [ ] **After intro:** QuickSpecTable (e-bike posts) or straight to first product (accessory posts)
- [ ] **Product sections:** AmazonProductCard → 2-4 paragraphs of prose → "What to watch out for" bold callout
- [ ] **What to Avoid:** Prose with bold lead-ins. One CalloutBox max (legal/safety only).
- [ ] **Making Your Choice:** Short intro sentence → KeyTakeaway → closing paragraph with internal links
- [ ] **No two widgets are adjacent** without prose between them
- [ ] **No section is more than 4 consecutive paragraphs** without some visual element (heading, bold lead-in, product card, or widget)
