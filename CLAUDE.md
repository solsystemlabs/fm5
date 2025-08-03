# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application built with TanStack Start (full-stack React framework) and TypeScript. The project is in early development with basic login functionality implemented.

**Tech Stack:**
- **Framework**: TanStack Start (React full-stack framework)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4 with shadcn/ui components
- **Forms**: TanStack React Form with validation
- **Routing**: TanStack Router with file-based routing
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

## Architecture & Code Organization

### Routing Structure
- Uses TanStack Router with file-based routing
- Routes defined in `src/routes/` directory
- Route tree auto-generated in `src/routeTree.gen.ts`
- Root layout in `src/routes/__root.tsx` with global styles and meta tags

### Component Structure
- **UI Components**: `src/components/ui/` - shadcn/ui primitives (Button, Card, Input, Label)
- **Page Components**: `src/components/` - Feature components like LoginPage and LoginForm
- **Utilities**: `src/lib/utils.ts` - Contains `cn()` utility for class merging

### Import Path Aliases
- `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)
- Use `@/components/ui/button` instead of relative paths

### Current Features
- Login page at `/login` route with form validation
- Form handling using TanStack React Form
- Email validation (required, valid email format)
- Password validation (required, minimum 6 characters)
- Responsive design with TailwindCSS

### shadcn/ui Configuration
- Style: "new-york" 
- Base color: slate
- CSS variables enabled
- Components installed: button, card, input, label
- Configuration in `components.json`

## Code Style Patterns

### Form Implementation
- Use TanStack React Form for form state management
- Implement field-level validation with onChange validators
- Handle form submission with async onSubmit handlers
- Display validation errors inline below fields

### Component Props
- UI components accept standard HTML props via spreading (`...props`)
- Use `className` prop with `cn()` utility for conditional styling
- Type component props using `React.ComponentProps<"element">`

### Styling Approach
- Use TailwindCSS utility classes
- Leverage shadcn/ui components for consistent design system
- Apply responsive design with Tailwind breakpoints
- Use CSS variables for theming (defined in global.css)

## Development Notes

- Server runs on port 3000 by default
- Hot reload enabled through Vite
- TypeScript strict mode with null checks enabled
- ES modules configuration (`"type": "module"` in package.json)
- Auto-import resolution for `@/` paths via vite-tsconfig-paths