# TrailRider Gear Content System

## What This Site Is

TrailRiderGear.com is an **affiliate content engine**. It earns revenue through Amazon Associates links embedded in research-backed buying guides for e-bike accessories. Every blog post is a potential revenue-generating asset. The content IS the product.

## Terminology

- **Guides** (not "reviews") — we call them buying guides because we don't hands-on test products. We research, aggregate, and synthesize.
- **Posts** — the internal system term for any `.mdx` content file.
- The public-facing site uses "guides" everywhere: "LATEST GUIDES", "BROWSE GUIDES", "VIEW ALL GUIDES".

## Content Production Pipeline

This site uses an AI-assisted content pipeline with three core files:

### 1. Content Schedule (`content-schedule.json`)

The single source of truth for what content needs to be produced and when. Each entry has:
- `slug` — the URL-safe filename
- `title` — the guide title
- `category` — which site category it belongs to
- `status` — `planned` → `in-progress` → `draft` → `published`
- `targetPublishDate` — when it should go live
- `notes` — seed research directions and product leads

### 2. Master Writing Prompt (`.windsurf/prompts/write-blog-post.md`)

The detailed instruction set for writing a guide. Covers:
- Research requirements (real ASINs, real prices, browser-verified data)
- Post structure (frontmatter, opening prose, product cards, what-to-avoid, closing)
- Writing style rules (voice, tone, honesty standards)
- Quality checklist (every data point must be verified)

### 3. Workflow (`.windsurf/workflows/write-next-post.md`)

The step-by-step process: read schedule → read prompt → research → write → save → update schedule → report.

**To produce the next guide**, use the `/write-next-post` workflow or simply say "write the next blog post."

## Scheduled Publishing

Posts with a future `publishDate` in their frontmatter will not appear on the live site until that date passes. This means content can be written in batches and scheduled to drip out over time. The filtering happens in `src/lib/posts.ts` via `getPublishedBlogPosts()`.

## Content Integrity Rules

- **Real products only** — every product links to verified Amazon listings or manufacturer pages
- **No fictional ASINs** — no placeholder product codes
- **No invented field tests** — never claim hands-on testing that didn't happen
- **Transparent sourcing** — cite Reddit, REI, OutdoorGearLab, manufacturer specs
- **Affiliate disclosure** — every guide ends with a disclosure line

## Categories

- `fishing-gear` — rod holders, tackle storage, fishing accessories
- `cargo-systems` — trailers, racks, cargo platforms, hitches, fenders, kickstands
- `storage-systems` — panniers, bags, waterproof storage, coolers, frame bags, handlebar bags
- `hunting-accessories` — gun racks, bow mounts, game carts
- `navigation-power` — GPS mounts, phone mounts, battery packs, solar chargers
- `safety-gear` — lights, helmets, locks, mirrors, tire repair kits

## File Locations

Posts are saved to **both** locations for compatibility:
- `public/data/posts/{slug}.mdx` (primary)
- `src/content/blog/{slug}.mdx` (backward compatibility)

## Product Database

`real_ebike_accessories.csv` contains 52+ verified products with real manufacturer URLs, review site links, verified pricing, and real ASINs.
