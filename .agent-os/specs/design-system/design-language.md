# FM5 Design Language Specification

> Design System for Filament Manager 5 (FM5)
> Created: 2025-09-09

## Overview

FM5's design language focuses on **industrial precision** with **approachable usability**, reflecting the technical nature of 3D printing while maintaining accessibility for small business owners. The system emphasizes clarity, efficiency, and professional credibility.

## Design Principles

### 1. **Industrial Precision**

- Clean, geometric forms inspired by 3D printing precision
- Consistent spacing and alignment that reflects manufacturing accuracy
- Technical aesthetic without overwhelming complexity

### 2. **Functional Clarity**

- Information hierarchy that prioritizes actionable data
- Clear visual feedback for system states and user actions
- Intuitive workflows that match business processes

### 3. **Professional Approachability**

- Sophisticated enough for business use, simple enough for daily operations
- Warm, trustworthy colors that reduce anxiety around financial/inventory management
- Accessible design that works for users of varying technical expertise

### 4. **Efficient Density**

- Optimal information density for power users managing large inventories
- Scannable layouts that support quick decision-making
- Progressive disclosure to avoid overwhelming new users

## Brand Identity

### Brand Personality

- **Professional**: Reliable, trustworthy, competent
- **Innovative**: Forward-thinking, tech-savvy, efficient
- **Approachable**: Friendly, supportive, non-intimidating
- **Precise**: Accurate, detailed, methodical

### Visual Voice

- Modern and clean, not trendy or flashy
- Technical but not intimidating
- Organized and systematic
- Confidence-inspiring for business decisions

## Design Tokens

### Color System

#### Primary Palette

```scss
// Primary Blue - Professional, trustworthy
$blue-50: #eff6ff; // Light backgrounds, subtle highlights
$blue-100: #dbeafe; // Hover states, light borders
$blue-200: #bfdbfe; // Disabled states
$blue-300: #93c5fd; // Secondary elements
$blue-400: #60a5fa; // Interactive elements
$blue-500: #3b82f6; // Primary actions, links
$blue-600: #2563eb; // Primary button backgrounds
$blue-700: #1d4ed8; // Active states
$blue-800: #1e40af; // Text on light backgrounds
$blue-900: #1e3a8a; // High contrast text

// Secondary Orange - Warmth, energy (3D printing heat)
$orange-50: #fff7ed;
$orange-100: #ffedd5;
$orange-200: #fed7aa;
$orange-300: #fdba74;
$orange-400: #fb923c;
$orange-500: #f97316; // Accent color, warning states
$orange-600: #ea580c; // CTA buttons, alerts
$orange-700: #c2410c;
$orange-800: #9a3412;
$orange-900: #7c2d12;
```

#### Neutral Palette

```scss
// Grays - Professional foundation
$gray-50: #f9fafb; // Page backgrounds
$gray-100: #f3f4f6; // Card backgrounds
$gray-200: #e5e7eb; // Borders, dividers
$gray-300: #d1d5db; // Input borders
$gray-400: #9ca3af; // Placeholder text
$gray-500: #6b7280; // Secondary text
$gray-600: #4b5563; // Body text
$gray-700: #374151; // Headings
$gray-800: #1f2937; // Primary text
$gray-900: #111827; // High contrast text
```

#### Status Colors

```scss
// Success Green - Inventory in stock, completed actions
$green-50: #ecfdf5;
$green-100: #d1fae5;
$green-500: #10b981; // Success states
$green-600: #059669; // Success buttons
$green-700: #047857; // Active success states

// Warning Yellow - Low stock alerts
$yellow-50: #fffbeb;
$yellow-100: #fef3c7;
$yellow-500: #f59e0b; // Warning states
$yellow-600: #d97706; // Warning buttons

// Error Red - Out of stock, errors
$red-50: #fef2f2;
$red-100: #fee2e2;
$red-500: #ef4444; // Error states
$red-600: #dc2626; // Error buttons
$red-700: #b91c1c; // Active error states
```

### Typography

#### Font Stack

```scss
// Primary: System fonts for performance and familiarity
$font-sans:
  ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
  'Segoe UI Symbol', 'Noto Color Emoji';

// Monospace: For technical data, file names, measurements
$font-mono:
  ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono',
  'Courier New', monospace;
```

#### Type Scale

```scss
// Headings
$text-xs: 0.75rem; // 12px - Captions, labels
$text-sm: 0.875rem; // 14px - Small text, metadata
$text-base: 1rem; // 16px - Body text
$text-lg: 1.125rem; // 18px - Emphasized text
$text-xl: 1.25rem; // 20px - Small headings
$text-2xl: 1.5rem; // 24px - Section headings
$text-3xl: 1.875rem; // 30px - Page headings
$text-4xl: 2.25rem; // 36px - Display headings

// Line Heights
$leading-tight: 1.25; // Headings
$leading-normal: 1.5; // Body text
$leading-relaxed: 1.75; // Large blocks of text

// Font Weights
$font-normal: 400; // Body text
$font-medium: 500; // Emphasized text
$font-semibold: 600; // Subheadings, labels
$font-bold: 700; // Headings, important text
```

### Spacing System

#### Base Unit: 4px

```scss
// Spacing scale (4px base unit)
$space-px: 1px;
$space-0: 0;
$space-1: 0.25rem; // 4px
$space-2: 0.5rem; // 8px
$space-3: 0.75rem; // 12px
$space-4: 1rem; // 16px
$space-5: 1.25rem; // 20px
$space-6: 1.5rem; // 24px
$space-8: 2rem; // 32px
$space-10: 2.5rem; // 40px
$space-12: 3rem; // 48px
$space-16: 4rem; // 64px
$space-20: 5rem; // 80px
$space-24: 6rem; // 96px
```

#### Component Spacing

```scss
// Internal component spacing
$component-padding-sm: $space-3 $space-4; // 12px 16px
$component-padding-md: $space-4 $space-6; // 16px 24px
$component-padding-lg: $space-6 $space-8; // 24px 32px

// Between-component spacing
$component-gap-sm: $space-4; // 16px
$component-gap-md: $space-6; // 24px
$component-gap-lg: $space-8; // 32px
$component-gap-xl: $space-12; // 48px
```

### Border Radius

```scss
$radius-none: 0;
$radius-sm: 0.125rem; // 2px - Small elements
$radius-base: 0.25rem; // 4px - Buttons, inputs
$radius-md: 0.375rem; // 6px - Cards, panels
$radius-lg: 0.5rem; // 8px - Large cards
$radius-xl: 0.75rem; // 12px - Modals
$radius-full: 9999px; // Circular elements
```

### Shadows

```scss
// Depth system for layering
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05); // Subtle borders
$shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1); // Cards
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1); // Elevated cards
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1); // Dropdowns, popovers
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1); // Modals
$shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); // Pressed states
```

## Component Design Patterns

### Size Variants

All interactive components follow consistent sizing:

```scss
// Component heights
$size-sm: 2rem; // 32px - Compact interfaces
$size-md: 2.5rem; // 40px - Default size
$size-lg: 3rem; // 48px - Prominent actions

// Icon sizes
$icon-sm: 1rem; // 16px
$icon-md: 1.25rem; // 20px
$icon-lg: 1.5rem; // 24px
```

### State System

Consistent visual feedback across all components:

#### Interactive States

- **Default**: Base component appearance
- **Hover**: Subtle background/border color change
- **Focus**: Clear focus ring for accessibility
- **Active**: Pressed/clicked state
- **Disabled**: Reduced opacity and interaction removal

#### Validation States

- **Valid**: Green accent (success color)
- **Invalid**: Red accent (error color)
- **Warning**: Yellow accent (warning color)
- **Info**: Blue accent (primary color)

### Visual Hierarchy

#### Information Density Levels

1. **Compact**: High-density data tables, power user interfaces
2. **Comfortable**: Default spacing for most interfaces
3. **Spacious**: Landing pages, onboarding flows

#### Content Priority

1. **Primary**: Main actions and critical information
2. **Secondary**: Supporting information and alternative actions
3. **Tertiary**: Metadata and contextual information

## Accessibility Requirements

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Management**: Visible focus indicators on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels

### Inclusive Design

- **Motor**: Large touch targets (minimum 44px)
- **Cognitive**: Clear labeling and consistent patterns
- **Visual**: High contrast mode support
- **Responsive**: Mobile-first design approach

## Component Architecture

### React Aria Integration

All form and interactive components built on React Aria primitives for:

- Built-in accessibility
- Consistent behavior across browsers
- Keyboard navigation
- Screen reader support
- Touch/mobile optimization

### Component Structure

```
components/
├── foundation/           # React Aria wrappers
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   └── Modal/
├── composite/           # Business-specific components
│   ├── FileUploader/
│   ├── InventoryCard/
│   └── ExpenseForm/
└── layout/             # Layout and navigation
    ├── AppShell/
    ├── Header/
    └── Sidebar/
```

### Naming Conventions

- **Components**: PascalCase (e.g., `FileUploader`, `InventoryCard`)
- **Props**: camelCase (e.g., `isDisabled`, `showIcon`)
- **CSS Classes**: kebab-case with BEM methodology
- **Design Tokens**: kebab-case with prefixes (e.g., `--color-primary-500`)

## Implementation Guidelines

### Development Workflow

1. **Design Tokens First**: Define all tokens in CSS custom properties
2. **Foundation Components**: Build React Aria wrappers with design system
3. **Composite Components**: Create feature-specific components using foundation
4. **Documentation**: Storybook documentation for all components

### Quality Standards

- **TypeScript**: Full type coverage for all components
- **Testing**: Unit tests for component logic, visual regression tests
- **Performance**: Lazy loading, code splitting for optimal bundle sizes
- **Responsive**: Mobile-first approach with progressive enhancement

This design language will ensure consistency and quality across all FM5 components while maintaining accessibility and professional aesthetics.
