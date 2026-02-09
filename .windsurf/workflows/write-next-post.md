---
description: Write the next blog post from the content schedule
---

# Write Next Blog Post

This workflow produces the next planned buying guide for TrailRiderGear.com.

## Steps

1. **Read the content schedule.** Open `content-schedule.json` in the project root. Find the first **Tier 1** entry where `"status": "planned"` (Tier 1 first, then Tier 2, etc.). Note its `slug`, `title`, `category`, `keywords`, `targetPublishDate`, `notes`, and `productAsins`.

2. **Read the product library.** Open `scripts/product-library.json`. Look up each ASIN from the post's `productAsins` array. This gives you verified product data: name, brand, price, rating, reviewCount, image, features. This is your product arsenal — use it directly in `AmazonProductCard` widgets.

3. **Read the master writing prompt.** Open `.windsurf/prompts/write-blog-post.md` and follow every instruction in it. This is your style guide, structure template, keyword targeting rules, and quality checklist.

4. **Research the topic.** Use web search, Puppeteer, and browser tools to supplement the product library data. Do NOT skip this step. Do NOT invent data.

   **4a. Verify every product via Puppeteer on Amazon.** For each ASIN in the post's `productAsins`, navigate to its Amazon page and confirm it is in stock with current data:

   - Navigate: `puppeteer_navigate` to `https://www.amazon.com/dp/{ASIN}`
   - Screenshot: `puppeteer_screenshot` (width 1200, height 800) to visually confirm the page loaded correctly
   - Extract data: `puppeteer_evaluate` with this script to pull structured product info:
     ```js
     const title = document.querySelector('#productTitle')?.textContent?.trim();
     const price = document.querySelector('.a-price .a-offscreen')?.textContent?.trim();
     const rating = document.querySelector('#acrPopover .a-icon-alt')?.textContent?.trim();
     const reviewCount = document.querySelector('#acrCustomerReviewText')?.textContent?.trim();
     const availability = document.querySelector('#availability span')?.textContent?.trim();
     const mainImage = document.querySelector('#landingImage')?.src;
     const features = [];
     document.querySelectorAll('#feature-bullets .a-list-item').forEach(el => {
       const text = el.textContent?.trim();
       if (text && text.length > 10) features.push(text.substring(0, 200));
     });
     JSON.stringify({ title, price, rating, reviewCount, availability, mainImage, features }, null, 2);
     ```
   - If the page shows **"Currently unavailable"** or **"No featured offers available"**, the product cannot be used in the guide. You must find a replacement (see step 4b).
   - If price/rating/reviewCount differ from the product library, use the **live Amazon data** in the post.

   **4b. Replace unavailable products.** If any product is unavailable on Amazon:

   - Search Amazon via Puppeteer: `puppeteer_navigate` to `https://www.amazon.com/s?k={relevant+search+terms}&s=review-rank`
   - Screenshot the results page, then extract candidate ASINs:
     ```js
     const results = [];
     document.querySelectorAll('[data-asin]').forEach(el => {
       const asin = el.getAttribute('data-asin');
       if (!asin || asin.length < 5) return;
       const title = el.querySelector('h2 span')?.textContent?.trim();
       const price = el.querySelector('.a-price .a-offscreen')?.textContent?.trim();
       const rating = el.querySelector('.a-icon-alt')?.textContent?.trim();
       if (title) results.push({ asin, title: title.substring(0, 120), price, rating });
     });
     JSON.stringify(results, null, 2);
     ```
   - Pick replacements that are: in stock, well-reviewed (4.0+ stars, 50+ reviews preferred), relevant to the guide's topic, and priced competitively.
   - Navigate to each replacement's product page and run the full extraction script from step 4a to get verified data.
   - Update the `productAsins` array in `content-schedule.json` to reflect the actual products used.

   **4c. Web research for editorial content.** Use `search_web` and `read_url_content` to gather:
   - Reddit threads (r/ebikes, r/hunting, r/fishing, r/bikepacking) for real user experiences
   - Professional review sites (Electric Bike Report, Outdoor Life, GearJunkie) for expert opinions
   - Manufacturer websites for specs not in the product library
   - Use this research to write informed pros/cons, "What to watch out for" callouts, and the "What to Avoid" section.

5. **Write the post.** Create the `.mdx` file following the structure in the master prompt. Save it to BOTH locations:
   - `src/content/blog/{slug}.mdx`
   - `public/data/posts/{slug}.mdx`

6. **Integrate widgets.** Open `.windsurf/widget-bank.md` and follow the Visual Rhythm Checklist at the bottom. Specifically:
   - Add `KeyTakeaway` to the "Making Your Choice" section (every post, no exceptions).
   - Add `QuickSpecTable` after the intro (e-bike posts only).
   - Add one `CalloutBox` if there's a legal/regulatory note worth pulling out (don't force it).
   - Verify no two widgets are adjacent without prose between them.
   - Verify no section has more than 4 consecutive paragraphs without a visual break.
   - Reference the widget bank for exact props, imports, and usage examples.

7. **Update the content schedule.** In `content-schedule.json`, change the post's `status` from `"planned"` to `"draft"` (if frontmatter has `draft: true`) or `"published"` (if `draft: false`). Set `actualPublishDate` to today's date in `YYYY-MM-DD` format.

8. **Run quality checks.** Verify every item on the checklist at the bottom of the master prompt AND the Visual Rhythm Checklist in the widget bank. Confirm all ASINs, prices, image URLs, and affiliate tags are correct.

9. **Report completion.** Tell the user which post was written, how many products it covers, the target keywords, and what the next planned post in the schedule is.
