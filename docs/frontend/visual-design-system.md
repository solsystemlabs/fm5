# Visual Design System

## Color Palette - Professional & Refined

**Primary Colors:**

- **Slate 600** (#475569) - Primary actions, navigation, key UI elements
- **Slate 500** (#64748B) - Secondary actions, less prominent interactive elements
- **Slate 400** (#94A3B8) - Borders, dividers, disabled states

**Background & Surface:**

- **Slate 50** (#F8FAFC) - Page backgrounds, subtle section differentiation
- **White** (#FFFFFF) - Card backgrounds, modal surfaces, primary content areas
- **Slate 100** (#F1F5F9) - Hover states, selected items, input backgrounds

**Semantic Colors:**

- **Success: Emerald 600** (#059669) - Successful operations, sufficient inventory
- **Warning: Orange 600** (#D97706) - Low stock, attention needed (NOT yellow primary!)
- **Error: Red 600** (#DC2626) - Failed operations, critical issues
- **Info: Blue 600** (#2563EB) - Informational messages, help text

**Text Colors:**

- **Primary Text:** Slate 900 (#0F172A) - Headlines, important content
- **Secondary Text:** Slate 600 (#475569) - Body text, descriptions
- **Muted Text:** Slate 400 (#94A3B8) - Captions, timestamps, less important info

## Typography Scale

```css
/* Clean, readable hierarchy */
.text-hero: text-3xl font-semibold text-slate-900     /* Page titles */
.text-heading: text-xl font-medium text-slate-800     /* Section headers */
.text-subheading: text-lg font-medium text-slate-700  /* Subsection titles */
.text-body: text-base text-slate-600                  /* Body content */
.text-caption: text-sm text-slate-500                 /* Captions, metadata */
.text-micro: text-xs text-slate-400                   /* Timestamps, fine print */
```

## Spacing System - Generous & Consistent

```css
/* Systematic spacing scale */
--spacing-xs: 12px /* Related elements, tight groupings */ --spacing-sm: 16px
  /* Standard element spacing */ --spacing-md: 24px
  /* Section boundaries, component spacing */ --spacing-lg: 32px
  /* Major section separation */ --spacing-xl: 48px
  /* Page-level spacing, content separation */ /* Component-specific spacing */
  .card-padding: p-6 /* Internal card content */ .section-spacing: space-y-8
  /* Between major sections */ .grid-spacing: gap-6 /* Grid and flex layouts */
  .form-spacing: space-y-4 /* Form elements */;
```

## Component Specifications

### Dashboard Cards

```
Design: Clean white background with subtle shadow
Spacing: 24px internal padding, 16px between elements
Typography: Heading text-lg, body text-base, numbers text-2xl font-semibold
Layout: Icon/status top-left, main content center, action bottom-right
States: Default, hover (subtle slate-50 background), loading
```

### Model Cards

```
Design: Square/rectangular with rounded corners (8px)
Content: Large thumbnail, title overlay, action buttons on hover
Spacing: 16px internal padding, 6px grid gap
Typography: Title text-base font-medium, metadata text-sm
States: Default, hover (lift shadow), selected (slate border)
```

### Inventory Items

```
Design: Horizontal layout with color swatch prominence
Content: Color circle (24px), name/details, quantity gauge, actions
Spacing: 16px vertical padding, 12px horizontal spacing
Visual: Color accuracy critical - precise hex representation
States: Normal, low-stock (orange background), out-of-stock (red border)
```

### File Import Components

```
Design: Prominent drag-and-drop zone with clear visual feedback
Content: Large upload target, supported formats list, progress indicators
Spacing: 48px vertical padding for drop zone, 24px between progress items
Typography: Upload instructions text-lg, file names text-base, status text-sm
States: Default, drag-over (highlighted border), processing, complete, error
Visual: Animated upload progress bars, file type icons, clear success/error states
```

### Navigation

```
Design: Clean sidebar with grouped sections
Layout: Icon + label, collapsible sections, active state indication
Spacing: 12px vertical padding per item, 8px section separation
Typography: text-base for main items, text-sm for subsections
States: Default, hover, active (slate-100 background)
```
