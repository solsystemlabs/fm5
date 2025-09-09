# FM5 Component Specifications

> Component Implementation Guidelines for React Aria Wrappers
> Created: 2025-09-09

## Component Architecture Principles

### 1. Consistent API Design

All components follow predictable patterns for props, variants, and behavior to reduce cognitive load for developers.

### 2. Accessibility First

Built on React Aria primitives to ensure WCAG 2.1 AA compliance out of the box with proper keyboard navigation, screen reader support, and focus management.

### 3. Composable Design

Components can be combined and extended to create more complex interfaces while maintaining consistency.

### 4. Performance Optimized

Lazy loading, minimal re-renders, and efficient bundle splitting for optimal runtime performance.

## Foundation Components

### Button Component

#### API Design

```tsx
interface ButtonProps {
  // Variants
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'

  // States
  isDisabled?: boolean
  isLoading?: boolean

  // Content
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'

  // Behavior
  onPress?: () => void
  type?: 'button' | 'submit' | 'reset'

  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
}
```

#### Visual Specifications

```scss
// Primary Button
.button-primary {
  background: var(--color-primary-600);
  color: var(--color-white);
  border: 1px solid var(--color-primary-600);

  &:hover {
    background: var(--color-primary-700);
    border-color: var(--color-primary-700);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  &:active {
    background: var(--color-primary-800);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Size variations
.button-sm {
  height: var(--size-sm);
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}

.button-md {
  height: var(--size-md);
  padding: 0 var(--space-4);
  font-size: var(--text-base);
}

.button-lg {
  height: var(--size-lg);
  padding: 0 var(--space-6);
  font-size: var(--text-lg);
}
```

#### Implementation Example

```tsx
import { Button as AriaButton } from 'react-aria-components'
import { clsx } from 'clsx'

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  icon: Icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={clsx(
        'button',
        `button-${variant}`,
        `button-${size}`,
        isLoading && 'button-loading',
        className,
      )}
      isDisabled={props.isDisabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="button-icon" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="button-icon" />}
        </>
      )}
    </AriaButton>
  )
}
```

### Input Component

#### API Design

```tsx
interface InputProps {
  // Variants
  variant?: 'default' | 'filled' | 'minimal'
  size?: 'sm' | 'md' | 'lg'

  // Input types
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

  // States
  isDisabled?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  isInvalid?: boolean

  // Content
  label: string
  placeholder?: string
  description?: string
  errorMessage?: string
  value?: string
  defaultValue?: string

  // Icons and addons
  prefix?: React.ReactNode
  suffix?: React.ReactNode

  // Events
  onChange?: (value: string) => void
  onBlur?: (e: FocusEvent) => void
  onFocus?: (e: FocusEvent) => void

  // Validation
  validate?: (value: string) => string | undefined

  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
}
```

#### Visual Specifications

```scss
.input-field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.input-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-base);
  background: var(--color-white);
  transition:
    border-color 150ms,
    box-shadow 150ms;

  &:hover {
    border-color: var(--color-gray-400);
  }

  &:focus-within {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }

  &[data-invalid] {
    border-color: var(--color-red-500);

    &:focus-within {
      box-shadow: 0 0 0 3px var(--color-red-100);
    }
  }
}

.input-element {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--color-gray-800);

  &::placeholder {
    color: var(--color-gray-400);
  }

  &:disabled {
    cursor: not-allowed;
    color: var(--color-gray-500);
  }
}

// Size variations
.input-sm {
  .input-control {
    height: var(--size-sm);
    padding: 0 var(--space-3);
  }

  .input-element {
    font-size: var(--text-sm);
  }
}

.input-md {
  .input-control {
    height: var(--size-md);
    padding: 0 var(--space-4);
  }
}

.input-lg {
  .input-control {
    height: var(--size-lg);
    padding: 0 var(--space-5);
  }

  .input-element {
    font-size: var(--text-lg);
  }
}
```

### Select Component

#### API Design

```tsx
interface SelectProps<T> {
  // Content
  label: string
  placeholder?: string
  description?: string
  errorMessage?: string

  // Options
  items: Array<{ key: string; label: string; value: T; disabled?: boolean }>
  selectedKey?: string
  defaultSelectedKey?: string

  // Variants
  variant?: 'default' | 'filled' | 'minimal'
  size?: 'sm' | 'md' | 'lg'

  // States
  isDisabled?: boolean
  isRequired?: boolean
  isInvalid?: boolean

  // Features
  isSearchable?: boolean
  allowCustomValue?: boolean
  isMultiple?: boolean

  // Events
  onSelectionChange?: (key: string) => void

  // Accessibility
  'aria-label'?: string
}
```

### Modal Component

#### API Design

```tsx
interface ModalProps {
  // State
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void

  // Variants
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  // Content
  title: string
  children: React.ReactNode

  // Actions
  primaryAction?: {
    label: string
    onPress: () => void
    isLoading?: boolean
    variant?: ButtonProps['variant']
  }
  secondaryAction?: {
    label: string
    onPress: () => void
  }

  // Behavior
  isDismissable?: boolean
  closeOnEscape?: boolean

  // Accessibility
  'aria-labelledby'?: string
  'aria-describedby'?: string
}
```

## Composite Components

### FileUploader Component

#### API Design

```tsx
interface FileUploaderProps {
  // Behavior
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes

  // Content
  title?: string
  description?: string

  // States
  isDisabled?: boolean
  isLoading?: boolean

  // Events
  onFilesChange: (files: File[]) => void
  onError?: (error: string) => void

  // Upload functionality
  uploadUrl?: string
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (results: any[]) => void
}
```

### DataTable Component

#### API Design

```tsx
interface DataTableProps<T> {
  // Data
  data: T[]
  columns: Array<{
    key: keyof T
    title: string
    sortable?: boolean
    width?: string
    render?: (value: any, item: T) => React.ReactNode
  }>

  // Selection
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void

  // Pagination
  totalItems?: number
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void

  // Sorting
  sortDescriptor?: { column: keyof T; direction: 'asc' | 'desc' }
  onSortChange?: (descriptor: {
    column: keyof T
    direction: 'asc' | 'desc'
  }) => void

  // Actions
  bulkActions?: Array<{
    key: string
    label: string
    icon?: React.ComponentType
    onPress: (selectedKeys: Set<string>) => void
  }>

  // Loading states
  isLoading?: boolean
  loadingState?: 'loading' | 'sorting' | 'filtering'

  // Empty state
  emptyState?: React.ReactNode
}
```

## Development Guidelines

### File Structure

```
src/components/
├── foundation/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.scss
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   └── Select/
├── composite/
│   ├── FileUploader/
│   ├── DataTable/
│   └── InventoryCard/
└── layout/
    ├── AppShell/
    ├── Header/
    └── Sidebar/
```

### Testing Requirements

1. **Unit Tests**: Component logic and prop handling
2. **Accessibility Tests**: ARIA attributes and keyboard navigation
3. **Visual Regression Tests**: Consistent rendering across variants
4. **Integration Tests**: Complex component interactions

### Documentation Standards

1. **Storybook Stories**: All variants and states documented
2. **API Documentation**: TypeScript interfaces with JSDoc
3. **Usage Guidelines**: When and how to use each component
4. **Accessibility Notes**: Specific a11y considerations per component

### Performance Considerations

1. **Bundle Splitting**: Components lazy-loaded where appropriate
2. **Memoization**: React.memo for expensive renders
3. **Event Optimization**: Debounced inputs, throttled scrolling
4. **Asset Optimization**: SVG icons, optimized images

This specification ensures consistent, accessible, and maintainable components across the FM5 application.
