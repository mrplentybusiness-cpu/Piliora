# PILIORA - Luxury Skincare E-Commerce Platform

## Overview

PILIORA is a premium, luxury skincare e-commerce website showcasing 100% pure Pili Oil products from the Philippines. The application features a minimalist, organic luxury design aesthetic with a React frontend, Express backend, and PostgreSQL database. The site includes a public-facing storefront with elegant product presentation, a direct-to-consumer checkout flow, and an admin CMS for content and order management. Amazon is available as a secondary purchase option.

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
- **Connection**: pg Pool with DATABASE_URL environment variable

### Authentication
- **Admin Access**: Basic auth (username:password Base64 encoded) on admin-only API endpoints
- **Login**: POST `/api/admin/login` validates credentials, stores in sessionStorage
- **Protected Routes**: Admin dashboard at `/admin` with login gate at `/admin/login`
- **Admin API Protection**: All order management endpoints (GET/PATCH /api/orders/*) require Basic auth header

### E-Commerce Flow
- **Quick Buy Drawer**: Opens from "Shop Now" on homepage, shows product with quantity selector
- **Product Page**: `/product` — full product details, Buy Now button
- **Checkout**: `/checkout` — shipping form, order summary with NY tax (8.875%) + shipping ($8.99, free over $150), places order via API
- **Order Emails**: Confirmation, shipping update, and cancellation emails via SMTP (nodemailer) using Piliora@piliora.com
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
- **Status Updates**: Dropdown to change status (pending/confirmed/shipped/delivered/cancelled)
- **Tracking**: Input field for tracking numbers when shipping orders
- **Email Notifications**: Status changes trigger customer email notifications

### Build System
- **Client Build**: Vite produces static assets to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Optimization**: Common dependencies bundled to reduce cold start times

## Key Files
- `shared/schema.ts` — Database schema (users, settings, orders), Zod schemas, types
- `server/routes.ts` — All API endpoints with admin auth middleware
- `server/email.ts` — SMTP transactional emails (nodemailer)
- `server/storage.ts` — IStorage interface and DatabaseStorage implementation
- `client/src/pages/Home.tsx` — Homepage with Quick Buy drawer
- `client/src/pages/ProductPage.tsx` — Product detail page
- `client/src/pages/Checkout.tsx` — Checkout flow with shipping form
- `client/src/pages/AdminDashboard.tsx` — Admin CMS with Orders, Images, Content, Settings tabs
- `client/src/lib/api.ts` — Frontend API functions with admin auth headers
- `client/src/lib/data.ts` — Static fallback content and PRODUCT data
- `client/src/components/layout/Layout.tsx` — Header, footer, navigation

## External Dependencies

### Third-Party Services
- **Product Sales**: Direct checkout + Amazon as secondary option
- **Image Hosting**: Cloudinary for image uploads (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- **Email**: Gmail SMTP via nodemailer (GMAIL_USER, GMAIL_APP_PASSWORD)

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Image hosting
- `SMTP_HOST`: Mail server hostname (e.g., mail.piliora.com or from Whois.com email settings)
- `SMTP_PORT`: Mail server port (default: 465 for SSL, 587 for TLS)
- `SMTP_SECURE`: Set to "false" for port 587/STARTTLS, omit or "true" for port 465/SSL
- `SMTP_USER`: Email address (Piliora@piliora.com)
- `SMTP_PASSWORD`: Email account password
- `PORT`: Server port (defaults to 5000 in development)

### Key NPM Packages
- **Database**: `drizzle-orm`, `pg`, `drizzle-zod`
- **Validation**: `zod`, `@hookform/resolvers`
- **UI**: Full shadcn/ui suite with Radix primitives
- **Animation**: `framer-motion`
- **Email**: `nodemailer`
- **Date Handling**: `date-fns`

### Deployment
- Configured for Railway deployment with `process.env.PORT` support
- Production build outputs CommonJS bundle for Node.js
- Static assets served from Express in production mode
- Footer: "Built by Plenty Web Design" linking to www.PlentyWebDesign.com
