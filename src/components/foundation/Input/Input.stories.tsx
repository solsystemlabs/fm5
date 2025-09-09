import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Foundation/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component built with React Aria for accessibility and form validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'minimal'],
      description: 'Visual style variant of the input',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    description: {
      control: 'text',
      description: 'Help text displayed below the input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message displayed when validation fails',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    isReadOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    isInvalid: {
      control: 'boolean',
      description: 'Whether the input has validation errors',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
}

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Product Name',
    placeholder: 'Enter product name',
  },
}

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    label: 'Search',
    placeholder: 'Search products...',
  },
}

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" label="Small Input" placeholder="Small size" />
      <Input size="md" label="Medium Input" placeholder="Medium size" />
      <Input size="lg" label="Large Input" placeholder="Large size" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input sizes for various use cases.',
      },
    },
  },
}

// States
export const WithDescription: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    description: 'This will be displayed publicly on your profile.',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    errorMessage: 'Please enter a valid email address.',
    isInvalid: true,
    defaultValue: 'invalid-email',
  },
}

export const Required: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    isRequired: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    isDisabled: true,
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    defaultValue: 'This value cannot be changed',
    isReadOnly: true,
  },
}

// With prefixes and suffixes
export const WithPrefix: Story = {
  args: {
    label: 'Website URL',
    placeholder: 'mywebsite',
    prefix: 'https://',
  },
}

export const WithSuffix: Story = {
  args: {
    label: 'Price',
    placeholder: '0.00',
    suffix: 'USD',
  },
}

export const WithPrefixAndSuffix: Story = {
  args: {
    label: 'Domain',
    placeholder: 'mysite',
    prefix: 'https://',
    suffix: '.com',
  },
}

// Different input types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Tel" type="tel" placeholder="+1 (555) 000-0000" />
      <Input label="URL" type="url" placeholder="https://example.com" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different HTML input types supported by the component.',
      },
    },
  },
}

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-96 p-6 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
      
      <Input
        label="Full Name"
        placeholder="John Doe"
        isRequired
      />
      
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        isRequired
        description="We'll never share your email with anyone else."
      />
      
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        prefix="+1"
      />
      
      <Input
        label="Website"
        type="url"
        placeholder="mywebsite"
        prefix="https://"
        suffix=".com"
      />
      
      <div className="pt-4">
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Submit
        </button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of inputs used in a form context.',
      },
    },
  },
}