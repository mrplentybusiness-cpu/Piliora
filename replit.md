# PILIORA - Luxury Skincare E-Commerce Platform

## Overview

PILIORA is a premium, luxury skincare e-commerce website showcasing 100% pure Pili Oil products from the Philippines. The application features a minimalist, luxury design aesthetic with a React frontend, Express backend, and PostgreSQL database. The site includes a public-facing storefront with elegant product presentation, a direct-to-consumer checkout flow via Stripe, and an admin CMS for content and order management. Amazon link is optional and admin-controlled (hidden when empty).

## User Preferences

Preferred communication style: Simple, everyday language.
- Design: Gold color (#c9a962), sharp corners, Playfair Display serif font, no fade animations
- Content mirror: If it shows on frontend, it must be editable in admin backend
- DO NOT CHANGE ANY IMAGES unless specified
- Admin credentials: PilioraAdmin / Piliora123 (changeable via Settings tab)
- Live domain: https://www.piliora.com

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Styling**: Tailwind CSS v4 with custom theme configuration for luxury aesthetic
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for subtle, high-end scroll and transition effects
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Typography**: Playfair Display (serif) for headings, Inter (sans-serif) for body text

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api/` prefix
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Static file serving from built assets

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Three tables - `users` (admin auth), `settings` (JSON content), `orders` (customer orders)
- **Migrations**: Drizzle Kit for schema management (`db:push` command)
- **Connection**: pg Pool with DATABASE_URL environment variable, SSL enabled in production

### Authentication
- **Admin Access**: Basic auth (username:password Base64 encoded) on admin-only API endpoints
- **Login**: POST `/api/admin/login` validates credentials, stores in sessionStorage
- **Protected Routes**: Admin dashboard at `/admin` with login gate at `/admin/login`
- **Admin API Protection**: All order management endpoints (GET/PATCH /api/orders/*) require Basic auth header

### E-Commerce Flow
- **Quick Buy Drawer**: Opens from "Shop Now" on homepage, shows product with quantity selector
- **Product Page**: `/product` — full product details, Buy Now button
- **Checkout**: `/checkout` — shipping form, order summary with NY tax (8.875%) + flat rate shipping ($1.99), creates order then redirects to Stripe Checkout Session
- **Stripe Payment**: Uses Stripe Checkout Sessions (`POST /api/checkout/create-session`) — dynamically creates a session with the correct discounted total, then redirects customer to Stripe's hosted checkout page
- **Stripe Backend**: stripe-replit-sync manages Stripe schema, webhooks, and data sync
- **Order Emails**: Confirmation, shipping update, and cancellation emails via SMTP (nodemailer) using Piliora@piliora.com (Titan Email — requires paid plan for SMTP access)
- **Promo Codes**: Admin-managed via Settings tab — stored in site content as `promoCodes` array. Default codes: PILIORA99 (99% off), PILIORA50 (50% off), PILIORA20 (20% off). Admin can create custom codes with any discount %, toggle active/inactive, or delete. Validated via `POST /api/promo/validate`; discount stored in order (`discountAmount`, `promoCode` columns)
- **Pack Options**: Admin-managed via Product tab — stored in site content as `packOptions` array. Default packs: 1 Pack ($85), 2 Pack ($160), 5 Pack ($375), 10 Pack ($700). Admin can adjust quantities, labels, prices, and toggle visibility. Replaces the old free quantity selector on Quick Buy, Product Page, and Checkout
- **Amazon Fallback**: Secondary "Also available on Amazon" link throughout

### Content Management (Admin Dashboard)
- **CMS Approach**: All site text, images, and links stored in `settings` table as JSON
- **Admin Tabs**: 5 consolidated tabs — Orders, Product, Homepage, Our Story, Settings
- **Product Tab**: Product info (name/price/volume/Amazon link), product photos (main/lifestyle/gallery with upload), product text (tagline/subtitle/description/quick buy), benefits, ingredients, usage instructions
- **Homepage Tab**: Hero section (text + images), Science section (text + image), Daily Ritual (3 steps), Benefits cards, Gallery headings
- **Our Story Tab**: Story hero, Origin section (text + image), Philosophy pillars, Commitment section
- **Settings Tab**: Header/navigation, Logos (footer/mobile), Footer text/social links, Admin credentials
- **Content Schema**: Zod-validated `siteContentSchema` for hero, science, ritual, product, benefits, gallery, story, and layout sections
- **Fallback Data**: Local static content in `client/src/lib/data.ts` used as initial/fallback values

### Admin Order Portal
- **Orders Tab**: Default tab in admin dashboard showing order stats (total, pending, shipped, revenue)
- **Order Management**: Collapsible order rows with customer info, shipping details, order items
- **Status Updates**: Dropdown to change status (pending/pending_payment/confirmed/shipped/delivered/cancelled)
- **Cancel & Refund**: Selecting "Cancelled" triggers a confirmation dialog; issues Stripe refund via payment intent if available, otherwise cancels and advises manual Stripe dashboard refund. Refund ID stored in order notes.
- **Tracking**: Input field for tracking numbers when shipping orders
- **Email Notifications**: Status changes trigger customer email notifications (when SMTP is active)
- **Admin Notifications**: New orders send email notification to Piliora@piliora.com

### Build System
- **Client Build**: Vite produces static assets to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs` (CJS format)
- **Optimization**: Common dependencies (stripe, nodemailer, cloudinary, stripe-replit-sync, etc.) bundled to reduce cold start times
- **Start Script**: `start.sh` runs `db:push` then `node dist/index.cjs`

## Key Files
- `shared/schema.ts` — Database schema (users, settings, orders), Zod schemas, types
- `server/routes.ts` — All API endpoints with admin auth middleware
- `server/email.ts` — SMTP transactional emails (nodemailer) via Titan Email
- `server/storage.ts` — IStorage interface and DatabaseStorage implementation
- `server/stripeClient.ts` — Stripe client via Replit connector (publishable key, secret key, StripeSync)
- `server/webhookHandlers.ts` — Stripe webhook processing via stripe-replit-sync
- `server/index.ts` — Express app setup, Stripe init, webhook route, middleware
- `server/static.ts` — Production static file serving
- `script/build.ts` — Production build script (Vite + esbuild)
- `client/src/pages/Home.tsx` — Homepage with Quick Buy drawer
- `client/src/pages/ProductPage.tsx` — Product detail page
- `client/src/pages/Checkout.tsx` — Checkout flow with shipping form + Stripe Payment Link redirect
- `client/src/pages/CheckoutSuccess.tsx` — Post-payment confirmation page
- `client/src/pages/AdminDashboard.tsx` — Admin CMS with Orders, Product, Homepage, Our Story, Settings tabs
- `client/src/lib/api.ts` — Frontend API functions with admin auth headers
- `client/src/lib/data.ts` — Static fallback content and PRODUCT data
- `client/src/components/layout/Layout.tsx` — Header, footer, navigation

## External Dependencies

### Third-Party Services
- **Payments**: Stripe Payment Link for direct checkout + Amazon as secondary option
- **Image Hosting**: Cloudinary for image uploads (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- **Email**: Titan Email SMTP via nodemailer (smtp.titan.email, Piliora@piliora.com) — multi-port fallback (465 SSL → 587 STARTTLS → 2525 alt), retry on failure, connection timeouts (10s connect, 15s socket), requires paid Titan plan for SMTP access

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Image hosting
- `SMTP_HOST`: smtp.titan.email
- `SMTP_PORT`: 465 (SSL)
- `SMTP_SECURE`: "true"
- `SMTP_USER`: Piliora@piliora.com
- `SMTP_PASSWORD`: Titan Email password (requires paid plan)
- `PORT`: Server port (defaults to 5000 in development)

### Key NPM Packages
- **Database**: `drizzle-orm`, `pg`, `drizzle-zod`
- **Payments**: `stripe`, `stripe-replit-sync`
- **Validation**: `zod`, `@hookform/resolvers`
- **UI**: Full shadcn/ui suite with Radix primitives
- **Animation**: `framer-motion`
- **Email**: `nodemailer`
- **Images**: `cloudinary`
- **Date Handling**: `date-fns`

### Deployment
- Build: `npm run build` (Vite client + esbuild server)
- Start: `NODE_ENV=production node dist/index.cjs`
- Production build outputs CJS bundle for Node.js
- Database tables auto-created at startup via `ensureTables()` in server/index.ts (no drizzle-kit needed at runtime)
- Static assets served from Express in production mode
- SSL enabled for database connections in production
- `stripe` and `stripe-replit-sync` are external (not bundled by esbuild) — loaded from node_modules at runtime
- Footer: "Built by Plenty Web Design" linking to www.PlentyWebDesign.com

### Railway Deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm start` or `NODE_ENV=production node dist/index.cjs`
- **Required Environment Variables**:
  - `DATABASE_URL` — PostgreSQL connection string
  - `NODE_ENV` — `production`
  - `PORT` — Railway auto-sets this
  - `STRIPE_PUBLISHABLE_KEY` — Stripe live publishable key (pk_live_...)
  - `STRIPE_SECRET_KEY` — Stripe live secret key (sk_live_...)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image uploads
  - `SMTP_HOST` — `smtp.titan.email`
  - `SMTP_PORT` — `465`
  - `SMTP_SECURE` — `true`
  - `SMTP_USER` — `Piliora@piliora.com`
  - `SMTP_PASSWORD` — Titan Email password
- **Optional**: `APP_URL` — Set to `https://www.piliora.com` for Stripe webhook auto-registration
- Stripe webhooks: Set manually in Stripe Dashboard if `APP_URL` not set (point to `https://www.piliora.com/api/stripe/webhook`)
- **Railway-Specific Hardening**:
  - SSL enabled on all DB connections (main pool, StripeSync pool, Stripe migrations via sslmode=no-verify)
  - `reusePort` removed from server listen options for container compatibility
  - Email system: Titan Email SMTP with multi-port fallback (465/587/2525), 10s connection timeout, 15s socket timeout, retry with fresh transport on failure
  - SMTP connection verified at startup — logs `[EMAIL] SUCCESS` or `[EMAIL] ALL SMTP CONFIGS FAILED`
  - Zero Replit-specific runtime dependencies — no REPLIT_DOMAINS, no REPLIT_DEPLOYMENT, no Object Storage sidecar
  - Image uploads require Cloudinary (no fallback to Replit Object Storage); returns 503 with clear error if Cloudinary not configured
  - Debug endpoint dead-code-eliminated in production build
  - `stripe` and `stripe-replit-sync` loaded from node_modules (not bundled)

### Known Limitations
- Admin passwords stored as plaintext (future enhancement: add bcrypt hashing)
