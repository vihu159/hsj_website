# HSJ — Harsahaimal Shiamlal Jewellers

A luxury showcase website for HSJ jewellery: collections, photoshoots, store information, and contact. Built with Next.js and Tailwind CSS.

## Run locally

**Run these commands from the project folder**, not from your home directory:

```bash
cd ~/Desktop/Work/HSJ_NEW_WEBSITE
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### See both backend and website locally

1. **Create a `.env` file** in the project root (copy from `.env.example` if you have one):
   ```
   NEXT_PUBLIC_ADMIN_FIRST=true
   ```
2. **Restart the dev server** (`npm run dev`) so it picks up `.env`.
3. **Open [http://localhost:3000](http://localhost:3000).** You’ll see a **gateway** with two options:
   - **Open Admin Panel** → goes to the backend at `/admin/dashboard` (collections, catalogs, banners, site content, etc.).
   - **View Website** → goes to the public site (homepage, collections, catalog, photoshoots, stores, contact).

Use two browser tabs (or one for admin, one for the site) to work in the backend and preview the website at the same time. To go straight to the site without the gateway, open [http://localhost:3000/?view=site](http://localhost:3000/?view=site). To go straight to admin, open [http://localhost:3000/admin](http://localhost:3000/admin).

## Admin backend (catalog only, no e‑commerce)

Login is **off by default**. Go to [http://localhost:3000/admin](http://localhost:3000/admin) (or click “Open Admin Panel” on the gateway). To turn on login (username + password): (1) In the admin sidebar open **Admin users** and create at least one user (username + password; save the password — it is stored hashed and cannot be viewed). (2) Set `REQUIRE_ADMIN_AUTH=true` in `.env.local` and restart. (3) From then on, sign in at `/admin` with that username and password. Add or remove users anytime from **Admin users** when logged in.

### What you can do in the admin

- **Collections** — Create/edit collections and pieces. Each upload shows **recommended sizes in pixels** (e.g. collection cover 800×1000 px, piece image 800×800 px).
- **Bulk upload** — On a collection’s edit page, use “Select images (multiple)”. Images are checked for size (min 400×400 px); those that fit are added **in order** to **Pending**; the rest are skipped. You then **approve** them in Pending to make them live on the site.
- **Import from Excel** — On the dashboard, upload an Excel/CSV file. Columns: `collection_slug`, `name`, `description`, `image_url`. Rows are added to **Pending**; approve in **Pending** to publish.
- **Pending items** — Dashboard link “Pending items”. Review items from bulk upload or Excel; **Approve** to add them to the catalog, or **Reject** to discard.
- **Banners & creatives** — Upload hero and section banners. Sizes are shown (e.g. hero 1920×1080 px, section 1440×600 px).
- **Photoshoots** — Create/edit photoshoots and gallery images (with size hints).
- **Site & stores** — Brand name, tagline, contact email/phone, and both store addresses, hours, map links.

Uploaded images go to `public/images/collections/` and `public/images/photoshoots/`. Content is stored in `content/*.json`; the site reads from these, so changes appear after refresh.

**Deployment:** The admin writes to the project folder. On a serverless host (e.g. Vercel) the filesystem is read-only; use the admin when running locally or on a Node server with disk access, or add a headless CMS later.

## Collection vs Catalog vs Pieces

| | **Collection** | **Catalog** | **Pieces** |
|---|----------------|-------------|------------|
| **What it is** | A themed group for the **landing page** (e.g. Heritage, Bridal, Contemporary). Used in hero carousels and the main “Collections” section. | A **product line** by material and type: one of **Gold / Silver / Diamond / Polki** × a **subcategory** (e.g. Necklace, Ring, or custom like Kada, Choker). Shown in the **Catalog** menu and on `/catalogs/<slug>`. | The **individual items** inside a collection or a catalog: each has a name, description, and image. |
| **Where it appears** | Homepage (scroll carousels), **Collections** page, `/collections/<slug>`. | **Catalog** dropdown in the nav (only if the catalog is live and has at least one live product), and `/catalogs/<slug>`. | Inside a collection page (as “pieces”) or a catalog page (as “products”). |
| **Use case** | Campaigns, themes, editorial groupings (e.g. “Bridal”, “Bloom”). | Shop-by-type browsing: “Polki Necklace”, “Gold Bangles”, “Diamond Ring”. You can add **custom subcategories** (e.g. Kada, Haar) in addition to the suggested list. | The actual jewellery items customers can enquire about. |
| **Archive / remove** | You can **archive** a collection (hidden on site) or **delete** it. Pieces can be **archived** or **removed** individually. | You can **archive** a catalog (drops from menu) or **delete** it. Products can be **archived** or **removed** individually. | Archiving hides the piece/product on the site but keeps it in the backend. Removing deletes it from the collection/catalog. |

**In short:** **Collections** = themes for the main site and landing experience. **Catalogs** = product lines (Gold/Silver/Diamond/Polki × subcategory) in the Catalog menu. **Pieces** = the items inside either.

## Catalog and enquiries (no e‑commerce)

The site is a **catalog only**. Each piece has an **Enquire for price** button that opens the contact page with the product name pre-filled. Customers submit the form or use **Email** / **WhatsApp** from the contact page; you respond with price and availability.

## Build

```bash
npm run build
npm start
```

## Content

You can manage content via the **admin** (see above), or edit files by hand:

- **Collections:** `content/collections/index.json` and `content/collections/<slug>.json`. Images in `public/images/collections/`.
- **Catalogs:** `content/catalogs/index.json` and `content/catalogs/<slug>.json`. Category is one of Gold/Silver/Diamond/Polki; subcategory can be a suggested one (Necklace, Ring, etc.) or **any custom name** (e.g. Kada, Choker, Haar).
- **Photoshoots:** `content/photoshoots/index.json` and `content/photoshoots/<slug>.json`. Images in `public/images/photoshoots/`.
- **Stores & contact:** `content/site.json`.

## Project structure

- `app/` — Pages and layouts (Next.js App Router)
- `components/` — Header, Footer, AnimateInView, etc.
- `content/` — JSON data for collections, photoshoots, and site info
- `lib/` — Helpers to load content
- `public/` — Static assets (add images here)

## Motion, header & carousels — manual test checklist

After changing the floating header, snap carousels, or scroll reveals:

1. **Header**
   - [ ] At top of page: header is merged (transparent, minimal).
   - [ ] Scroll down: header becomes a floating pill (blur, border, compact).
   - [ ] Scroll up: header stays floating (expanded feel).
   - [ ] Open menu: overlay opens; close and scroll still works.
   - [ ] Mobile: same behavior; Menu button has large tap target (min 44px).

2. **Reduced motion**
   - [ ] Enable “Reduce motion” (OS: Accessibility → Reduce motion). Reload.
   - [ ] Header stays static (no floating pill).
   - [ ] Section reveals show content immediately (no fade/translate).
   - [ ] Carousels: prev/next use instant scroll (no smooth).

3. **Carousels (homepage)**
   - [ ] Collections: horizontal snap; swipe/drag on mobile; prev/next on hover/focus; progress line visible.
   - [ ] Photoshoots: same; keyboard Left/Right moves slides.
   - [ ] Focus visible on carousel and buttons (gold ring).

4. **No regressions**
   - [ ] Admin: login, catalogs, collections, banners, site content load and save.
   - [ ] Public: collections, catalog, photoshoots, stores, contact routes work.
   - [ ] No layout shift (CLS): main content has top padding so fixed header doesn’t overlap.

## Tech stack

- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript
