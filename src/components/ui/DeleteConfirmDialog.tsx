import React, { useState } from 'react';
import { Button, Dialog, DialogTrigger, Modal, ModalOverlay, Heading } from 'react-aria-components';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => void;
  isLoading?: boolean;
  triggerClassName?: string;
}

export function DeleteConfirmDialog({ 
  title, 
  description, 
  itemName, 
  onConfirm, 
  isLoading = false,
  triggerClassName = ""
}: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${triggerClassName}`}>
        <TrashIcon className="h-4 w-4" />
        <span className="sr-only">Delete {itemName}</span>
      </Button>
      <ModalOverlay 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        isDismissable
      >
        <Modal className="bg-background rounded-lg shadow-lg max-w-md w-full">
          <Dialog className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <Heading slot="title" className="text-lg font-semibold text-foreground">
                  {title}
                </Heading>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-muted-foreground">
                {description}
              </p>
              <p className="text-foreground font-medium mt-2">
                "{itemName}"
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                onPress={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirm}
                isDisabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}