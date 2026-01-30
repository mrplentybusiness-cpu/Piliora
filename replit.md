# PILIORA - Luxury Skincare E-Commerce Platform

## Overview

PILIORA is a premium, luxury skincare e-commerce website showcasing 100% pure Pili Oil products from the Philippines. The application features a minimalist, organic luxury design aesthetic with a React frontend, Express backend, and PostgreSQL database. The site includes a public-facing storefront with elegant product presentation and an admin CMS for content management. All "Shop Now" actions link to an external Amazon store rather than processing payments locally.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Schema**: Two main tables - `users` (admin authentication) and `settings` (JSON content storage)
- **Migrations**: Drizzle Kit for schema management (`db:push` command)
- **Connection**: pg Pool with DATABASE_URL environment variable

### Authentication
- **Admin Access**: Simple username/password authentication via `/api/admin/login`
- **Credentials**: Stored in `users` table (passwords should be hashed in production)
- **Protected Routes**: Admin dashboard at `/admin` with login gate at `/admin/login`

### Content Management
- **CMS Approach**: All site text, images, and links stored in `settings` table as JSON
- **Content Schema**: Zod-validated `siteContentSchema` for hero, science, ritual, and product sections
- **Fallback Data**: Local static content in `client/src/lib/data.ts` used as initial/fallback values

### Build System
- **Client Build**: Vite produces static assets to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Optimization**: Common dependencies bundled to reduce cold start times

## External Dependencies

### Third-Party Services
- **Product Sales**: External Amazon link for all purchase actions (no local cart/checkout)
- **Image Hosting**: Currently using local assets; designed for Cloudinary or URL-based image updates

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `ADMIN_USER`: Admin username for CMS access (optional, used for seeding)
- `ADMIN_PASS`: Admin password for CMS access (optional, used for seeding)
- `PORT`: Server port (defaults to 5000 in development)

### Key NPM Packages
- **Database**: `drizzle-orm`, `pg`, `drizzle-zod`
- **Validation**: `zod`, `@hookform/resolvers`
- **UI**: Full shadcn/ui suite with Radix primitives
- **Animation**: `framer-motion`
- **Date Handling**: `date-fns`

### Deployment
- Configured for Railway deployment with `process.env.PORT` support
- Production build outputs CommonJS bundle for Node.js
- Static assets served from Express in production mode