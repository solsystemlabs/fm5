import React from 'react';
import { Button, ProgressBar, Label } from 'react-aria-components';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { QueuedToast } from 'react-stately';
import type { UploadTask } from '@/lib/background-upload-context';
import type { ToastData } from './ToastProvider';

interface UploadProgressToastProps {
  toast: QueuedToast<ToastData>;
  task: UploadTask;
  onClose: () => void;
}

export function UploadProgressToast({ toast, task, onClose }: UploadProgressToastProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'uploading':
      case 'pending':
        return <DocumentArrowUpIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentArrowUpIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'failed':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  const getTitle = () => {
    switch (task.status) {
      case 'pending':
        return 'Upload queued';
      case 'uploading':
        return 'Uploading files';
      case 'completed':
        return task.failedCount > 0 ? 'Upload completed with errors' : 'Upload completed';
      case 'failed':
        return 'Upload failed';
      default:
        return 'Processing upload';
    }
  };

  const getDescription = () => {
    const modelName = task.modelName || `Model ${task.modelId}`;
    
    switch (task.status) {
      case 'pending':
        return `${task.totalCount} files queued for ${modelName}`;
      case 'uploading':
        if (task.progress) {
          return `${modelName} • ${task.progress.speed || ''} ${task.progress.timeRemaining || ''}`.trim();
        }
        return `Uploading to ${modelName}`;
      case 'completed':
        if (task.failedCount > 0) {
          return `${task.uploadedCount} uploaded, ${task.failedCount} failed for ${modelName}`;
        }
        return `${task.uploadedCount} files uploaded to ${modelName}`;
      case 'failed':
        return `Failed to upload files to ${modelName}`;
      default:
        return modelName;
    }
  };

  // Auto-dismiss completed/failed toasts after 5 seconds
  React.useEffect(() => {
    if (task.status === 'completed' || task.status === 'failed') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [task.status, onClose]);

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        transition-all duration-200 ease-out
        animate-in slide-in-from-right-full
        ${getStatusColor()}
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground">
              {getTitle()}
            </div>
            
            <div className="text-sm text-muted-foreground mt-1">
              {getDescription()}
            </div>

            {/* Progress Bar for uploading status */}
            {task.status === 'uploading' && task.progress && (
              <div className="mt-3">
                <ProgressBar 
                  value={task.progress.percentage} 
                  maxValue={100}
                  className="w-full"
                >
                  {({ percentage, valueText }) => (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-muted-foreground">
                          Progress
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {valueText}
                        </span>
                      </div>
                      <div className="w-full bg-background/50 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </ProgressBar>
              </div>
            )}

            {/* File count progress for all statuses */}
            {(task.status === 'uploading' || task.status === 'completed') && (
              <div className="mt-2 text-xs text-muted-foreground">
                {task.uploadedCount} of {task.totalCount} files
                {task.failedCount > 0 && ` (${task.failedCount} failed)`}
              </div>
            )}

            {/* Error message for failed uploads */}
            {task.status === 'failed' && task.error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                {task.error}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        onPress={onClose}
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}