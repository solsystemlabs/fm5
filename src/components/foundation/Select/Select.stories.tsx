import { Select } from './Select'
import type { SelectOption } from './Select'
import type { Meta, StoryObj } from '@storybook/react'

// Sample data
const basicOptions: Array<SelectOption> = [
  { key: 'option1', label: 'Option 1', value: 'value1' },
  { key: 'option2', label: 'Option 2', value: 'value2' },
  { key: 'option3', label: 'Option 3', value: 'value3' },
  { key: 'option4', label: 'Option 4', value: 'value4', disabled: true },
]

const filamentTypes: Array<SelectOption> = [
  { key: 'pla', label: 'PLA', value: 'pla' },
  { key: 'abs', label: 'ABS', value: 'abs' },
  { key: 'petg', label: 'PETG', value: 'petg' },
  { key: 'tpu', label: 'TPU', value: 'tpu' },
  { key: 'wood', label: 'Wood Fill', value: 'wood' },
  { key: 'carbon', label: 'Carbon Fiber', value: 'carbon', disabled: true },
]

const priorities: Array<SelectOption> = [
  { key: 'low', label: 'Low Priority', value: 'low' },
  { key: 'medium', label: 'Medium Priority', value: 'medium' },
  { key: 'high', label: 'High Priority', value: 'high' },
  { key: 'urgent', label: 'Urgent', value: 'urgent' },
]

const meta: Meta<typeof Select> = {
  title: 'Foundation/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible select component built with React Aria for accessibility and consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'minimal'],
      description: 'Visual style variant of the select',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the select',
    },
    label: {
      control: 'text',
      description: 'Label text for the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    description: {
      control: 'text',
      description: 'Help text displayed below the select',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message displayed when validation fails',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the select is required',
    },
    isInvalid: {
      control: 'boolean',
      description: 'Whether the select has validation errors',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    label: 'Choose an option',
    items: basicOptions,
    placeholder: 'Select an option...',
  },
}

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Filament Type',
    items: filamentTypes,
    placeholder: 'Choose filament type...',
  },
}

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    label: 'Priority Level',
    items: priorities,
    placeholder: 'Set priority...',
  },
}

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Select
        size="sm"
        label="Small Select"
        items={basicOptions}
        placeholder="Small size"
      />
      <Select
        size="md"
        label="Medium Select"
        items={basicOptions}
        placeholder="Medium size"
      />
      <Select
        size="lg"
        label="Large Select"
        items={basicOptions}
        placeholder="Large size"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different select sizes for various use cases.',
      },
    },
  },
}

// States
export const WithDescription: Story = {
  args: {
    label: 'Filament Material',
    items: filamentTypes,
    placeholder: 'Choose material...',
    description: 'Select the filament material for your 3D print.',
  },
}

export const WithError: Story = {
  args: {
    label: 'Priority Level',
    items: priorities,
    placeholder: 'Set priority...',
    errorMessage: 'Please select a priority level.',
    isInvalid: true,
  },
}

export const Required: Story = {
  args: {
    label: 'Required Selection',
    items: basicOptions,
    placeholder: 'This field is required',
    isRequired: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    items: basicOptions,
    placeholder: 'This select is disabled',
    isDisabled: true,
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Pre-selected Option',
    items: filamentTypes,
    defaultSelectedKey: 'pla',
  },
}

// Business context examples
export const FilamentSelector: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Select
        label="Filament Brand"
        items={[
          { key: 'hatchbox', label: 'Hatchbox', value: 'hatchbox' },
          { key: 'overture', label: 'Overture', value: 'overture' },
          { key: 'prusament', label: 'Prusament', value: 'prusament' },
          { key: 'polymaker', label: 'PolyMaker', value: 'polymaker' },
        ]}
        placeholder="Select brand..."
      />

      <Select
        label="Material Type"
        items={filamentTypes}
        placeholder="Select material..."
        description="Choose the filament material for your project."
      />

      <Select
        label="Color"
        items={[
          { key: 'black', label: 'Black', value: 'black' },
          { key: 'white', label: 'White', value: 'white' },
          { key: 'red', label: 'Red', value: 'red' },
          { key: 'blue', label: 'Blue', value: 'blue' },
          { key: 'green', label: 'Green', value: 'green' },
          { key: 'clear', label: 'Clear', value: 'clear' },
        ]}
        placeholder="Select color..."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example of select components used for filament selection in a 3D printing context.',
      },
    },
  },
}

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-96 p-6 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>

      <Select
        label="Project Priority"
        items={priorities}
        placeholder="Set priority level..."
        isRequired
        description="This affects the order in your project queue."
      />

      <Select
        label="Print Quality"
        items={[
          { key: 'draft', label: 'Draft (0.3mm)', value: 'draft' },
          { key: 'standard', label: 'Standard (0.2mm)', value: 'standard' },
          { key: 'high', label: 'High Quality (0.1mm)', value: 'high' },
          { key: 'ultra', label: 'Ultra Quality (0.05mm)', value: 'ultra' },
        ]}
        placeholder="Select quality..."
        defaultSelectedKey="standard"
      />

      <Select
        label="Infill Percentage"
        items={[
          { key: '10', label: '10%', value: 10 },
          { key: '20', label: '20%', value: 20 },
          { key: '50', label: '50%', value: 50 },
          { key: '100', label: '100% (Solid)', value: 100 },
        ]}
        placeholder="Select infill..."
        defaultSelectedKey="20"
      />

      <div className="pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Save Settings
        </button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example of select components used in a 3D printing project configuration form.',
      },
    },
  },
}
