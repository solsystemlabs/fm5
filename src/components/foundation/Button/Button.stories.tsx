import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

// Example icons for demonstration
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const meta: Meta<typeof Button> = {
  title: 'Foundation/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible button component built with React Aria for accessibility and consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'ghost'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon relative to the text',
    },
    children: {
      control: 'text',
      description: 'Button content/text',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic button variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Button',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Item',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes for various use cases.',
      },
    },
  },
}

// States
export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Save Changes',
    isLoading: true,
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    isDisabled: true,
  },
}

// With icons
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Add Item',
    icon: PlusIcon,
    iconPosition: 'left',
  },
}

export const IconRight: Story = {
  args: {
    variant: 'secondary',
    children: 'Save',
    icon: SaveIcon,
    iconPosition: 'right',
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    icon: PlusIcon,
    'aria-label': 'Add new item',
  },
}

// Interactive examples
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" isLoading>Loading</Button>
        <Button variant="primary" isDisabled>Disabled</Button>
        <Button variant="primary" icon={PlusIcon}>With Icon</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants and states for comparison.',
      },
    },
  },
}