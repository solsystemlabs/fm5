import React from 'react';
import { Cell, ProgressBar, Label } from 'react-aria-components';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useModelUploadStatus } from '@/lib/background-upload-context';

interface UploadStatusCellProps {
  modelId: number;
  className?: string;
}

export function UploadStatusCell({ modelId, className }: UploadStatusCellProps) {
  const uploadStatus = useModelUploadStatus(modelId);

  // If there's no upload task for this model, don't show the upload status cell
  if (!uploadStatus.summary && !uploadStatus.isUploading && !uploadStatus.isPending) {
    return (
      <Cell className={`relative py-4 pr-3 text-sm ${className || ''}`}>
        <span className="text-muted-foreground text-sm">-</span>
      </Cell>
    );
  }

  const getStatusIcon = () => {
    if (uploadStatus.isUploading || uploadStatus.isPending) {
      return <ArrowPathIcon className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (uploadStatus.isCompleted) {
      return <CheckCircleIcon className={`h-4 w-4 ${uploadStatus.failed > 0 ? 'text-amber-500' : 'text-green-500'}`} />;
    }
    if (uploadStatus.isFailed) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (uploadStatus.isUploading || uploadStatus.isPending) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (uploadStatus.isCompleted) {
      return uploadStatus.failed > 0 
        ? 'text-amber-600 dark:text-amber-400' 
        : 'text-green-600 dark:text-green-400';
    }
    if (uploadStatus.isFailed) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-muted-foreground';
  };

  return (
    <Cell className={`relative py-4 pr-3 text-sm ${className || ''}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {uploadStatus.summary}
          </div>
          
          {/* Progress bar for uploading status */}
          {uploadStatus.isUploading && uploadStatus.progress && (
            <div className="mt-1">
              <ProgressBar 
                value={uploadStatus.progress.percentage} 
                maxValue={100}
                className="w-full"
                aria-label={`Upload progress: ${uploadStatus.progress.percentage}%`}
              >
                {({ percentage }) => (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </ProgressBar>
            </div>
          )}

          {/* File count progress for all statuses */}
          {(uploadStatus.isUploading || uploadStatus.isPending) && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {uploadStatus.uploaded}/{uploadStatus.total} files
            </div>
          )}

          {/* Error message for failed uploads */}
          {uploadStatus.isFailed && uploadStatus.error && (
            <div className="text-xs text-red-500 dark:text-red-400 mt-0.5 truncate">
              {uploadStatus.error}
            </div>
          )}
        </div>
      </div>
    </Cell>
  );
}