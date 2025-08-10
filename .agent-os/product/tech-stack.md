# Technical Stack

> Last Updated: 2025-08-10
> Version: 1.0.0

## Application Framework

- **Framework:** TanStack Start (React full-stack framework)
- **Version:** Latest stable

## Database

- **Primary Database:** PostgreSQL (recommended for 3D printing file metadata and user data)

## JavaScript

- **Framework:** React with TypeScript
- **Import Strategy:** Node modules with ES6 imports
- **Build Tool:** Vite

## CSS Framework

- **Framework:** TailwindCSS v4
- **UI Component Library:** shadcn/ui (New York style)

## Additional Stack Components

### Forms & Routing
- **Forms:** TanStack React Form with validation
- **Routing:** TanStack Router with file-based routing

### Typography & Icons
- **Fonts Provider:** System fonts (Inter/San Francisco)
- **Icon Library:** Lucide React

### Hosting & Deployment
- **Application Hosting:** Vercel (recommended for TanStack Start deployment)
- **Database Hosting:** Vercel Postgres or Supabase
- **Asset Hosting:** Vercel Edge Network or AWS S3 (for 3D model files)
- **Deployment Solution:** Vercel with GitHub integration

### Development
- **Code Repository:** GitHub (private repository recommended)
- **Package Manager:** npm
- **Development Server:** Vite dev server (port 3000)