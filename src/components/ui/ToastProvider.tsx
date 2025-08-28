import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastQueue, useToastQueue } from 'react-stately';
import { UploadProgressToast } from './UploadProgressToast';
import type { UploadTask } from '@/lib/background-upload-context';

export interface UploadToastData {
  type: 'upload-progress';
  task: UploadTask;
}

export type ToastData = UploadToastData;

// Create global toast queues
export const uploadToastQueue = new ToastQueue<ToastData>({
  maxVisibleToasts: 3
});

// Toast context for accessing queues
interface ToastContextValue {
  uploadToastQueue: ToastQueue<ToastData>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// Global toast region component
function GlobalToastRegion() {
  const uploadState = useToastQueue(uploadToastQueue);
  
  if (uploadState.visibleToasts.length === 0) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-md"
      role="region"
      aria-label="Upload notifications"
      aria-live="polite"
    >
      {uploadState.visibleToasts.map((toast) => {
        const toastData = toast.content;
        
        switch (toastData.type) {
          case 'upload-progress':
            return (
              <UploadProgressToast
                key={toast.key}
                toast={toast}
                task={toastData.task}
                onClose={() => uploadToastQueue.close(toast.key)}
              />
            );
          default:
            return null;
        }
      })}
    </div>,
    document.body
  );
}

// Main toast provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const contextValue: ToastContextValue = {
    uploadToastQueue
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <GlobalToastRegion />
    </ToastContext.Provider>
  );
}

// Utility functions for showing toasts
export const toastService = {
  showUploadProgress: (task: UploadTask) => {
    return uploadToastQueue.add({
      type: 'upload-progress',
      task
    }, {
      timeout: undefined // Don't auto-dismiss upload progress toasts
    });
  },

  updateUploadProgress: (toastKey: string, task: UploadTask) => {
    // Close existing toast and show updated one
    uploadToastQueue.close(toastKey);
    return toastService.showUploadProgress(task);
  },

  dismissUploadProgress: (toastKey: string) => {
    uploadToastQueue.close(toastKey);
  }
};