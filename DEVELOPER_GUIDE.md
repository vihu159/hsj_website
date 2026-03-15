# HSJ Jewellery Website — Developer Guide

A detailed reference for developers working on the HSJ (Harsahaimal Shiamlal Jewellers) luxury jewellery showcase website. Covers backend, frontend, admin, and UI architecture.

---

## Table of Contents
1. [Tech Stack & Overview](#1-tech-stack--overview)
2. [Project Structure](#2-project-structure)
3. [Data Models & Types](#3-data-models--types)
4. [Content Storage (JSON)](#4-content-storage-json)
5. [Backend — Library Modules](#5-backend--library-modules)
6. [Backend — API Routes](#6-backend--api-routes)
7. [Frontend — Pages & Routing](#7-frontend--pages--routing)
8. [Frontend — Components](#8-frontend--components)
9. [Admin Panel](#9-admin-panel)
10. [UI & Styling](#10-ui--styling)
11. [Environment & Configuration](#11-environment--configuration)

---

## 1. Tech Stack & Overview

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | App Router, React Server Components, API routes |
| **React 19** | UI framework |
| **TypeScript** | Static typing |
| **Tailwind CSS** | Utility-first styling |
| **Sharp** | Image optimization (Next.js Image) |
| **xlsx** | Excel import for bulk catalog uploads |

**Architecture:**
- **No e-commerce** — catalog-only site with “Enquire” CTAs (email/WhatsApp)
- **File-based content** — JSON files in `content/` (not a database)
- **Admin panel** — CRUD for collections, catalogs, photoshoots, banners, site content
- **Theme support** — Background and accent colours editable via admin

---

## 2. Project Structure

```
HSJ_NEW_WEBSITE/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (site data, catalog menu)
│   ├── page.tsx                  # Homepage (server)
│   ├── globals.css               # Global styles, CSS variables
│   ├── RootPageClient.tsx        # Client: Gateway vs HomePageContent
│   ├── admin/                    # Admin UI (sidebar layout)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── site/page.tsx
│   │   ├── banners/page.tsx
│   │   ├── pending/page.tsx
│   │   ├── collections/
│   │   ├── catalogs/
│   │   ├── photoshoots/
│   │   └── components/
│   ├── api/admin/                # Admin API routes
│   ├── collections/[slug]/       # Collection detail page
│   ├── catalogs/[slug]/          # Catalog detail page
│   ├── photoshoots/[slug]/
│   ├── stores/
│   ├── about/
│   └── contact/
├── components/                   # Shared UI components
│   ├── Header.tsx                # Hamburger menu, slide-in nav
│   ├── Footer.tsx
│   ├── LayoutWrapper.tsx         # Wraps main site with header/footer
│   ├── ThemeInjector.tsx         # Applies theme colours to CSS vars
│   ├── HomePageContent.tsx       # Homepage sections
│   └── Gateway.tsx               # Admin | View site choice (root)
├── lib/                          # Server-side logic (Node.js fs)
│   ├── site.ts                   # Site data, theme (uses fs)
│   ├── theme.ts                  # Theme types & defaults (no fs — client-safe)
│   ├── collections.ts
│   ├── catalogs.ts
│   ├── photoshoots.ts
│   ├── banners.ts
│   ├── pending.ts
│   ├── admin-auth.ts
│   └── creative-sizes.ts
├── content/                      # JSON content (filesystem)
│   ├── site.json
│   ├── banners.json
│   ├── pending.json
│   ├── collections/
│   ├── catalogs/
│   └── photoshoots/
├── public/images/                # Uploaded images
│   ├── collections/
│   ├── photoshoots/
│   └── site/
└── tailwind.config.ts
```

---

## 3. Data Models & Types

### Site & Theme

| Type | Location | Description |
|------|----------|-------------|
| `SiteData` | `lib/site.ts` | Brand name, logo, nav, homepage copy, stores, contact, theme |
| `NavItem` | `lib/site.ts` | `{ href: string; label: string }` |
| `Store` | `lib/site.ts` | `id`, `name`, `address`, `mapUrl`, `hours`, `phone` |
| `HomepageCopy` | `lib/site.ts` | Hero, CTAs, section headings |
| `ThemeColours` | `lib/theme.ts` | `background`, `backgroundAlt`, `surface`, `primary`, `primaryLight`, `text` (hex) |

### Collections

| Type | Location | Description |
|------|----------|-------------|
| `CollectionSummary` | `lib/collections.ts` | `slug`, `title`, `description`, `coverImage`, `status?` |
| `Piece` | `lib/collections.ts` | `id`, `name`, `description`, `image`, `status?` |
| `Collection` | `lib/collections.ts` | `CollectionSummary & { pieces: Piece[] }` |

**Status:** `"live"` | `"archived"` — archived collections/pieces are hidden on the public site.

### Catalogs

| Type | Location | Description |
|------|----------|-------------|
| `CatalogProduct` | `lib/catalogs.ts` | `id`, `name`, `description`, `image`, `status` |
| `Catalog` | `lib/catalogs.ts` | `slug`, `category`, `subcategory`, `title`, `status`, `products` |
| `Category` | `lib/catalogs.ts` | `"Gold"` | `"Silver"` | `"Diamond"` | `"Polki"` |
| `SUBCATEGORIES` | `lib/catalogs.ts` | Suggested list (Necklace, Ring, etc.); custom subcategories allowed |

**Categories:** Gold, Silver, Diamond, Polki  
**Subcategories:** Necklace, Ring, Earring, Set of 3, Nath, Tika, Bangles, Bracelet, Mangalsutra (or any custom string)

### Photoshoots

| Type | Location | Description |
|------|----------|-------------|
| `PhotoshootSummary` | `lib/photoshoots.ts` | `slug`, `title`, `date?`, `coverImage`, `caption?` |
| `PhotoshootImage` | `lib/photoshoots.ts` | `src`, `alt` |
| `Photoshoot` | `lib/photoshoots.ts` | `PhotoshootSummary & { images: PhotoshootImage[] }` |

### Banners

| Type | Location | Description |
|------|----------|-------------|
| `HeroBanner` | `lib/banners.ts` | `type?`, `image?`, `mobileImage?`, `video?` |
| `SectionBanner` | `lib/banners.ts` | `key`, `type?`, `image?`, `video?` |
| `BannersData` | `lib/banners.ts` | `{ hero, sections }` |

### Pending

| Type | Location | Description |
|------|----------|-------------|
| `PendingItem` | `lib/pending.ts` | Items from bulk upload or Excel import awaiting approval |

---

## 4. Content Storage (JSON)

All content is stored as JSON in `content/`. Paths and structure:

### `content/site.json`
```json
{
  "brandName": "HSJ",
  "fullName": "Harsahaimal Shiamlal Jewellers",
  "tagline": "...",
  "logo": "/images/site/logo.png",
  "nav": [{ "href": "/", "label": "Home" }, ...],
  "homepage": { "heroTitle": "...", "ctaPrimary": "...", ... },
  "footerCopy": "...",
  "footerCopyright": "...",
  "stores": [{ "id": "store-1", "name": "...", "address": "...", ... }],
  "contact": { "email": "...", "phone": "..." },
  "theme": {
    "background": "#faf8f5",
    "backgroundAlt": "#f5f0e6",
    "surface": "#1a1a1a",
    "primary": "#c9a962",
    "primaryLight": "#e5d4a8",
    "text": "#0a0a0a"
  }
}
```

### `content/banners.json`
```json
{
  "hero": { "type": "image", "image": "/placeholder.svg", "mobileImage": "", "video": "" },
  "sections": [{ "key": "section1", "type": "image", "image": "..." }]
}
```

### `content/collections/index.json`
Array of `CollectionSummary` objects.

### `content/collections/<slug>.json`
Full `Collection` with `pieces` array.

### `content/catalogs/index.json`
Array of `CatalogSummary` (slug, category, subcategory, title, status, productCount, liveCount).

### `content/catalogs/<slug>.json`
Full `Catalog` with `products` array.

### `content/photoshoots/index.json`
Array of `PhotoshootSummary`.

### `content/photoshoots/<slug>.json`
Full `Photoshoot` with `images` array.

### `content/pending.json`
```json
{ "items": [{ "id": "pending-...", "collectionSlug": "...", "name": "...", "image": "...", "source": "excel" | "bulk" }] }
```

---

## 5. Backend — Library Modules

### `lib/site.ts`
- **Uses:** `fs`, `path` (Node.js) — **do not import from client components**
- `getSiteData()` — Reads `content/site.json`, returns `SiteData` with merged theme. Defensive: missing/invalid file returns defaults.
- Exports: `SiteData`, `NavItem`, `Store`, `HomepageCopy`, `ThemeColours`, `defaultTheme`

### `lib/theme.ts`
- **No Node modules** — safe for client components
- `ThemeColours` type and `defaultTheme` constant
- Used by `LayoutWrapper`, `ThemeInjector`, admin site page

### `lib/collections.ts`
- `getAllCollections(includeArchived?)` — Returns live (or all) collections
- `getAllCollectionsAdmin()` — All collections including archived
- `getCollectionBySlug(slug, includeArchived?)` — Full collection or null
- `getCollectionBySlugPublic(slug)` — Live collection with only live pieces
- `getAllCollectionSlugs()` — For static params
- Defensive: missing/invalid files return `[]` or `null`

### `lib/catalogs.ts`
- `CATEGORIES`, `SUBCATEGORIES` constants
- `getAllCatalogs()`, `getCatalogBySlug(slug)`, `getLiveCatalogs()`, `getMenuCatalogGroups()`
- Write: `createCatalog()`, `updateCatalog()`, `deleteCatalog()`, `addCatalogProducts()`, `setCatalogProductStatus()`, `removeCatalogProduct()`, `bulkRemoveCatalogProducts()`
- `slugFromCategorySubcategory(category, subcategory)` — e.g. `gold-necklace`
- `syncCatalogIndex()` — Rebuilds `content/catalogs/index.json` from slug files

### `lib/photoshoots.ts`
- `getAllPhotoshoots()`, `getPhotoshootBySlug(slug)`, `getAllPhotoshootSlugs()`
- Defensive: missing/invalid files return `[]` or `null`

### `lib/banners.ts`
- `getBanners()` — Returns hero and sections
- `setBanners(data)` — Writes `content/banners.json`

### `lib/pending.ts`
- `getAllPending()`, `getPendingById(id)`, `addPendingItems(items)`, `removePending(id)`
- File: `content/pending.json`

### `lib/admin-auth.ts`
- `isAdmin()` — Returns `true` if `REQUIRE_ADMIN_AUTH !== "true"` or valid session cookie
- `setAdminCookie()`, `clearAdminCookie()`, `getSessionToken()`
- Cookie: `hsj_admin_session`

### `lib/creative-sizes.ts`
- `CREATIVE_SIZES` — Recommended pixel dimensions for hero, collection cover, piece image, etc.
- `getSizeHint(key)` — Human-readable string

---

## 6. Backend — API Routes

All admin routes call `requireAdmin()` (or `isAdmin()`) and return 401 if unauthorized.

### Config & Auth
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/config` | GET | `{ requireAuth: boolean }` |
| `/api/admin/me` | GET | `{ ok: boolean }` if session valid |
| `/api/admin/login` | POST | Body: `{ password }` — sets cookie if correct |
| `/api/admin/logout` | POST | Clears cookie |

### Site
| Route | Method | Body / Response |
|-------|--------|-----------------|
| `/api/admin/site` | GET | Full `SiteData` |
| `/api/admin/site` | PUT | Body: full `SiteData` — overwrites `content/site.json` |

### Collections
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/collections` | GET | List of collections (admin, includes archived) |
| `/api/admin/collections` | POST | Body: `{ slug?, title, description, coverImage }` — creates collection |
| `/api/admin/collections/[slug]` | GET | Full collection |
| `/api/admin/collections/[slug]` | PUT | Body: partial `Collection` — full update |
| `/api/admin/collections/[slug]` | PATCH | Body: `{ status? }` or `{ pieceId, pieceStatus }` — archive collection or piece |
| `/api/admin/collections/[slug]` | DELETE | Deletes collection file and index entry |
| `/api/admin/collections/[slug]/pieces/[pieceId]` | DELETE | Removes piece from collection |

### Catalogs
| Route | Method | Body / Description |
|-------|--------|-------------------|
| `/api/admin/catalogs` | GET | `{ catalogs, categories, subcategories }` |
| `/api/admin/catalogs` | POST | `{ category, subcategory, title? }` — creates catalog |
| `/api/admin/catalogs/[slug]` | GET | Full catalog |
| `/api/admin/catalogs/[slug]` | PUT | Partial catalog — full update |
| `/api/admin/catalogs/[slug]` | PATCH | `{ title?, status? }` |
| `/api/admin/catalogs/[slug]` | DELETE | Deletes catalog |
| `/api/admin/catalogs/[slug]/products` | POST | `{ products: [{ name, description, image }] }` — bulk add |
| `/api/admin/catalogs/[slug]/products/[productId]` | PATCH | `{ status: "live" \| "archived" }` |
| `/api/admin/catalogs/[slug]/products/[productId]` | DELETE | Removes product |
| `/api/admin/catalogs/[slug]/products/bulk-remove` | POST | `{ productIds: string[] }` |

### Photoshoots
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/photoshoots` | GET | List of photoshoots |
| `/api/admin/photoshoots` | POST | Body: `{ slug?, title, ... }` — creates photoshoot |
| `/api/admin/photoshoots/[slug]` | GET, PUT, DELETE | CRUD |

### Banners
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/banners` | GET | `BannersData` |
| `/api/admin/banners` | PUT | Body: `BannersData` |

### Pending
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/pending` | GET | Array of pending items |
| `/api/admin/pending/[id]` | GET | Single pending item |
| `/api/admin/pending/[id]` | POST | Approve — adds piece to collection, removes from pending |
| `/api/admin/pending/[id]` | DELETE | Reject — removes from pending |

### Upload
| Route | Method | Body | Response |
|-------|--------|------|----------|
| `/api/admin/upload` | POST | FormData: `file`, `type` (collections \| photoshoots \| site) | `{ url }` |
| `/api/admin/upload-bulk` | POST | FormData: `collectionSlug`, `files[]` | `{ accepted, rejected, rejectedDetails? }` — images min 400×400 go to Pending |
| `/api/admin/import-excel` | GET | — | Downloads `bulk-import-template.xlsx` |
| `/api/admin/import-excel` | POST | FormData: `file` (xlsx/csv) | `{ count, items }` — rows to Pending. Columns: `collection_slug`, `name`, `description`, `image_url` |

---

## 7. Frontend — Pages & Routing

### Root Layout (`app/layout.tsx`)
- Server component
- Calls `getSiteData()`, `getMenuCatalogGroups()`
- Passes `siteData`, `catalogMenuGroups` to `LayoutWrapper`
- Loads Google Fonts: Cormorant Garamond, Outfit

### Homepage (`app/page.tsx`)
- Server component
- Loads: `getSiteData()`, `getBanners()`, `getAllCollections()`, `getCollectionBySlugPublic()` per collection, `getAllPhotoshoots()`
- Passes to `RootPageClient`:
  - If `NEXT_PUBLIC_ADMIN_FIRST=true` and `?view=site` not set → shows `Gateway` (Admin | View site)
  - Else → `HomePageContent`

### Public Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage (hero, collection carousels, photoshoots, stores) |
| `/collections` | List of collections |
| `/collections/[slug]` | Collection detail with pieces |
| `/catalogs/[slug]` | Catalog detail (category × subcategory products) |
| `/photoshoots` | List of photoshoots |
| `/photoshoots/[slug]` | Photoshoot gallery |
| `/stores` | Store list |
| `/about` | About page |
| `/contact` | Contact form + Enquire flow |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin` | Admin entry (redirects to dashboard) |
| `/admin/dashboard` | Overview, collections, catalogs, photoshoots, Excel import |
| `/admin/site` | Site content, logo, nav, theme colours |
| `/admin/banners` | Hero image/video, section banners |
| `/admin/pending` | Pending items (approve/reject) |
| `/admin/collections/new` | Create collection |
| `/admin/collections/[slug]/edit` | Edit collection, pieces, bulk upload |
| `/admin/catalogs` | List catalogs |
| `/admin/catalogs/new` | Create catalog (category + subcategory) |
| `/admin/catalogs/[slug]/edit` | Edit catalog, add/remove/archive products |
| `/admin/photoshoots/new` | Create photoshoot |
| `/admin/photoshoots/[slug]/edit` | Edit photoshoot |

---

## 8. Frontend — Components

### LayoutWrapper (`components/LayoutWrapper.tsx`)
- **Client component**
- Renders `ThemeInjector`, Header, Footer for main site
- Skips header/footer for `/admin` and gateway (`/` with admin-first, no `?view=site`)
- Skip-to-main-content link

### Header (`components/Header.tsx`)
- **Client component**
- Logo (or brand name), hamburger button
- Slide-in menu from right (360px or 90vw)
- Nav links from `siteData.nav`
- Catalog: two-level hover — categories (Gold, Silver, etc.), then subcategories (Necklace, Ring, etc.)
- Overlay to close menu

### Footer (`components/Footer.tsx`)
- Nav links (excluding Home), logo, full name, footer copy, copyright

### ThemeInjector (`components/ThemeInjector.tsx`)
- **Client component**
- Receives `ThemeColours`
- Sets CSS variables on `document.documentElement`:
  - `background` → `--color-brand-ivory`
  - `backgroundAlt` → `--color-brand-cream`
  - `surface` → `--color-brand-charcoal`
  - `primary` → `--color-brand-gold`
  - `primaryLight` → `--color-brand-gold-light`
  - `text` → `--color-brand-black`

### HomePageContent (`components/HomePageContent.tsx`)
- Hero (image or video background), CTAs
- Collection sections with alternating horizontal scroll carousels (`animate-scroll-left`, `animate-scroll-right`)
- Photoshoots grid (3 featured)
- Stores section

### Gateway (`components/Gateway.tsx`)
- Shown when `NEXT_PUBLIC_ADMIN_FIRST=true` and `?view=site` not set
- "Open Admin Panel" | "View Website"

### Admin Components
- `ImageUpload` — URL input + upload, shows size hints from `CREATIVE_SIZES`

---

## 9. Admin Panel

### Layout
- Sidebar (desktop): Dashboard, New collection, New photoshoot, Catalogs, Pending, Banners, Site content & logo
- Mobile: Top bar with "HSJ Admin", "View site"
- Main content area: `md:pl-60`

### Dashboard
- Collections list with Edit links
- Photoshoots list
- Catalogs list
- Pending items count
- Excel import (columns: `collection_slug`, `name`, `description`, `image_url`) → Pending
- Download Excel template link

### Site Content Page
- Logo upload
- Nav links (href, label)
- Brand, contact
- Homepage copy (hero, CTAs, headings)
- **Theme & colours** — hex inputs + color pickers for: background, backgroundAlt, surface, primary, primaryLight, text
- Stores (name, address, hours, phone, map URL)

### Banners Page
- Hero: type (image | video), image upload or video URL
- Section banners: key, type (image | video), image or video URL

### Collection Edit
- Slug, title, description, cover image
- Pieces: add one, remove, archive/unarchive
- Bulk upload → Pending (size filter 400×400 min)
- Archive collection / Make live

### Catalog Edit
- Status (Archive catalog / Make live)
- Add product (image, name, description)
- Bulk add images (Product 1, Product 2, …)
- List products: select for bulk remove, archive/unarchive, remove

### Pending
- List items from bulk upload / Excel
- Approve → adds piece to collection, removes from pending
- Reject → removes from pending

---

## 10. UI & Styling

### Tailwind Config
- **Brand colours:** `brand-black`, `brand-charcoal`, `brand-gold`, `brand-gold-light`, `brand-cream`, `brand-ivory`
- **Fonts:** Cormorant Garamond (serif), Outfit (sans)
- **Animations:** `fade-in`, `fade-in-up`, `scroll-left`, `scroll-right`

### CSS Variables (globals.css)
- `:root` defines `--font-cormorant`, `--font-outfit`
- `--color-brand-*` — overridden at runtime by `ThemeInjector` from admin theme

### Key Classes
- `bg-brand-ivory`, `text-brand-black`, `text-brand-gold`, `border-brand-charcoal/10`
- `font-serif` (Cormorant), `font-sans` (Outfit)
- `animate-scroll-left`, `animate-scroll-right` — 50s infinite linear

### Recommended Image Sizes (CREATIVE_SIZES)
| Key | Dimensions |
|-----|------------|
| heroBanner | 1920×1080 |
| heroBannerMobile | 1080×1920 |
| collectionCover | 800×1000 |
| pieceImage | 800×800 |
| photoshootImage | 1200×1600 |
| photoshootCover | 800×1000 |
| sectionBanner | 1440×600 |

### Focus
- `*:focus-visible` uses `outline-brand-gold`

---

## 11. Environment & Configuration

### `.env` / `.env.example`
```
NEXT_PUBLIC_ADMIN_FIRST=true   # Show Gateway at / instead of homepage
REQUIRE_ADMIN_AUTH=true        # Enable password (optional)
ADMIN_PASSWORD=your-password   # Required if REQUIRE_ADMIN_AUTH=true
```

### Next.js Config
- Image formats: AVIF, WebP

### Client vs Server Imports
- **`lib/site.ts`** uses `fs` — **do not import from client components**. Use `lib/theme.ts` for theme types/defaults in client code.
- Type-only imports from `lib/site` (e.g. `import type { SiteData }`) are safe — they are erased at compile time.

---

## Quick Reference: Collection vs Catalog vs Pieces

| Concept | Purpose | Where |
|---------|---------|-------|
| **Collection** | Themed group for homepage (Heritage, Bridal, etc.) | Homepage carousels, `/collections` |
| **Catalog** | Product line: Category × subcategory (e.g. Polki Necklace) | Catalog menu, `/catalogs/[slug]` |
| **Pieces** | Items inside collections | Collection detail page |
| **Products** | Items inside catalogs | Catalog detail page |

---

*Last updated for the HSJ project codebase.*
