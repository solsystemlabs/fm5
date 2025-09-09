import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal, ModalTrigger } from './Modal'
import { Button } from '../Button'
import { Input } from '../Input'
import { Select } from '../Select'

const meta: Meta<typeof Modal> = {
  title: 'Foundation/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal dialog component built with React Aria for accessibility and consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the modal dialog',
    },
    title: {
      control: 'text',
      description: 'Title displayed in the modal header',
    },
    isDismissable: {
      control: 'boolean',
      description: 'Whether the modal can be dismissed by clicking outside or pressing escape',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic modal with controlled state
const BasicModalExample = ({ size = 'md', title = 'Modal Title' }: { size?: 'sm' | 'md' | 'lg' | 'xl' | 'full', title?: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size={size}
        title={title}
        isDismissable
      >
        <p className="text-gray-600">
          This is a basic modal dialog. It contains some content and can be dismissed
          by clicking outside, pressing escape, or using the close button.
        </p>
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: () => <BasicModalExample />,
}

// Size variants
export const Small: Story = {
  render: () => <BasicModalExample size="sm" title="Small Modal" />,
}

export const Large: Story = {
  render: () => <BasicModalExample size="lg" title="Large Modal" />,
}

export const ExtraLarge: Story = {
  render: () => <BasicModalExample size="xl" title="Extra Large Modal" />,
}

export const FullScreen: Story = {
  render: () => <BasicModalExample size="full" title="Full Screen Modal" />,
}

// Modal with actions
const ModalWithActionsExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false)
      setIsOpen(false)
    }, 2000)
  }

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal with Actions</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        primaryAction={{
          label: 'Save Changes',
          onPress: handleSave,
          isLoading,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setIsOpen(false),
        }}
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to save these changes? This action cannot be undone.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-yellow-800 text-sm">
            ⚠️ This will permanently update your settings.
          </p>
        </div>
      </Modal>
    </>
  )
}

export const WithActions: Story = {
  render: () => <ModalWithActionsExample />,
}

// Modal with form
const FormModalExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Add New Filament</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Add New Filament"
        size="lg"
        primaryAction={{
          label: 'Add Filament',
          onPress: () => setIsOpen(false),
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setIsOpen(false),
        }}
      >
        <form className="space-y-4">
          <Input
            label="Filament Name"
            placeholder="Enter filament name"
            isRequired
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Material Type"
              items={[
                { key: 'pla', label: 'PLA', value: 'pla' },
                { key: 'abs', label: 'ABS', value: 'abs' },
                { key: 'petg', label: 'PETG', value: 'petg' },
                { key: 'tpu', label: 'TPU', value: 'tpu' },
              ]}
              placeholder="Select material..."
              isRequired
            />
            
            <Input
              label="Weight (g)"
              type="number"
              placeholder="1000"
              isRequired
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Color"
              placeholder="e.g., Red, Blue, Black"
              isRequired
            />
            
            <Input
              label="Brand"
              placeholder="e.g., Hatchbox, Overture"
            />
          </div>
          
          <Input
            label="Cost per kg"
            type="number"
            placeholder="25.00"
            prefix="$"
            description="This helps track material costs for projects."
          />
        </form>
      </Modal>
    </>
  )
}

export const FormModal: Story = {
  render: () => <FormModalExample />,
}

// Danger modal variant
const DangerModalExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="danger" onPress={() => setIsOpen(true)}>
        Delete Project
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete Project"
        primaryAction={{
          label: 'Delete Forever',
          onPress: () => setIsOpen(false),
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Keep Project',
          onPress: () => setIsOpen(false),
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  This will permanently delete:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All project files and models</li>
                    <li>Print history and settings</li>
                    <li>Cost tracking data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export const DangerModal: Story = {
  render: () => <DangerModalExample />,
}

// Using ModalTrigger wrapper
export const WithTrigger: Story = {
  render: () => (
    <ModalTrigger
      modal={
        <Modal
          title="Quick Settings"
          primaryAction={{
            label: 'Save',
            onPress: () => {},
          }}
        >
          <p className="text-gray-600">
            This modal is triggered using the ModalTrigger wrapper component,
            which handles the open/close state automatically.
          </p>
        </Modal>
      }
    >
      <Button>Open with Trigger</Button>
    </ModalTrigger>
  ),
}