import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Direct upload function with progress
async function uploadModelFilesWithProgress(
  modelId: number,
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const now = Date.now();
        const elapsedTime = now - startTime;
        const speed = event.loaded / elapsedTime * 1000; // bytes/sec
        const timeRemaining = (event.total - event.loaded) / speed / 1000; // seconds
        
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
          speed: `${(speed / 1024 / 1024).toFixed(1)} MB/s`,
          timeRemaining: `${Math.round(timeRemaining)}s`
        });
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse server response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });
    
    xhr.open('POST', `/api/models/${modelId}/files`);
    xhr.timeout = 10 * 60 * 1000; // 10 minutes timeout
    xhr.send(formData);
  });
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: string;
  timeRemaining?: string;
  currentFile?: string;
}

export interface UploadTask {
  id: string;
  modelId: number;
  modelName: string;
  files: File[];
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress?: UploadProgress;
  error?: string;
  uploadedCount: number;
  failedCount: number;
  totalCount: number;
  startTime?: number;
}

interface UploadState {
  tasks: Record<string, UploadTask>;
  activeTaskIds: string[];
}

type UploadAction = 
  | { type: 'ADD_TASK'; task: UploadTask }
  | { type: 'START_UPLOAD'; taskId: string }
  | { type: 'UPDATE_PROGRESS'; taskId: string; progress: UploadProgress }
  | { type: 'UPLOAD_SUCCESS'; taskId: string; uploadedCount: number; failedCount: number }
  | { type: 'UPLOAD_FAILED'; taskId: string; error: string }
  | { type: 'REMOVE_TASK'; taskId: string };

const initialState: UploadState = {
  tasks: {},
  activeTaskIds: []
};

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.task.id]: action.task
        },
        activeTaskIds: [...state.activeTaskIds, action.task.id]
      };
    
    case 'START_UPLOAD':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            status: 'uploading',
            startTime: Date.now()
          }
        }
      };
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            progress: action.progress
          }
        }
      };
    
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            status: 'completed',
            uploadedCount: action.uploadedCount,
            failedCount: action.failedCount,
            progress: undefined
          }
        }
      };
    
    case 'UPLOAD_FAILED':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            status: 'failed',
            error: action.error,
            progress: undefined
          }
        }
      };
    
    case 'REMOVE_TASK':
      const newTasks = { ...state.tasks };
      delete newTasks[action.taskId];
      return {
        ...state,
        tasks: newTasks,
        activeTaskIds: state.activeTaskIds.filter(id => id !== action.taskId)
      };
    
    default:
      return state;
  }
}

interface BackgroundUploadContextValue {
  tasks: Record<string, UploadTask>;
  activeTaskIds: string[];
  queueUpload: (modelId: number, modelName: string, files: File[]) => string;
  getTaskByModelId: (modelId: number) => UploadTask | undefined;
  removeTask: (taskId: string) => void;
}

const BackgroundUploadContext = createContext<BackgroundUploadContextValue | undefined>(undefined);

export function BackgroundUploadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const queryClient = useQueryClient();

  const processUploadQueue = useCallback(async () => {
    const pendingTasks = Object.values(state.tasks).filter(task => task.status === 'pending');
    
    for (const task of pendingTasks) {
      dispatch({ type: 'START_UPLOAD', taskId: task.id });
      
      try {
        const formData = new FormData();
        task.files.forEach((file) => {
          formData.append('files', file);
        });

        // Direct fetch call to upload files with progress
        await uploadModelFilesWithProgress(
          task.modelId, 
          formData, 
          (progress) => {
            dispatch({ 
              type: 'UPDATE_PROGRESS', 
              taskId: task.id, 
              progress: {
                ...progress,
                currentFile: `Uploading files... ${progress.percentage}%`
              }
            });
          }
        );

        // Simulate some upload results for now
        dispatch({ 
          type: 'UPLOAD_SUCCESS', 
          taskId: task.id, 
          uploadedCount: task.files.length,
          failedCount: 0
        });

        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['models'] });
        queryClient.invalidateQueries({ queryKey: ['modelFiles'] });

      } catch (error) {
        dispatch({ 
          type: 'UPLOAD_FAILED', 
          taskId: task.id, 
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
  }, [state.tasks, queryClient]);

  // Process upload queue when new tasks are added
  useEffect(() => {
    const hasPendingTasks = Object.values(state.tasks).some(task => task.status === 'pending');
    if (hasPendingTasks) {
      processUploadQueue();
    }
  }, [state.tasks, processUploadQueue]);

  const queueUpload = useCallback((modelId: number, modelName: string, files: File[]): string => {
    const taskId = `upload-${modelId}-${Date.now()}`;
    const task: UploadTask = {
      id: taskId,
      modelId,
      modelName,
      files,
      status: 'pending',
      uploadedCount: 0,
      failedCount: 0,
      totalCount: files.length
    };

    dispatch({ type: 'ADD_TASK', task });
    return taskId;
  }, []);

  const getTaskByModelId = useCallback((modelId: number): UploadTask | undefined => {
    return Object.values(state.tasks).find(task => task.modelId === modelId);
  }, [state.tasks]);

  const removeTask = useCallback((taskId: string) => {
    dispatch({ type: 'REMOVE_TASK', taskId });
  }, []);

  const value = {
    tasks: state.tasks,
    activeTaskIds: state.activeTaskIds,
    queueUpload,
    getTaskByModelId,
    removeTask
  };

  return (
    <BackgroundUploadContext.Provider value={value}>
      {children}
    </BackgroundUploadContext.Provider>
  );
}

export function useBackgroundUpload() {
  const context = useContext(BackgroundUploadContext);
  if (!context) {
    throw new Error('useBackgroundUpload must be used within a BackgroundUploadProvider');
  }
  return context;
}

// Hook for getting upload status of a specific model
export function useModelUploadStatus(modelId: number) {
  const { getTaskByModelId } = useBackgroundUpload();
  const task = getTaskByModelId(modelId);
  
  // Debug logging
  if (task) {
    console.log(`Upload status for model ${modelId}:`, {
      status: task.status,
      uploaded: task.uploadedCount,
      total: task.totalCount,
      progress: task.progress
    });
  }
  
  return {
    isUploading: task?.status === 'uploading',
    isPending: task?.status === 'pending',
    isCompleted: task?.status === 'completed',
    isFailed: task?.status === 'failed',
    progress: task?.progress,
    error: task?.error,
    uploaded: task?.uploadedCount || 0,
    failed: task?.failedCount || 0,
    total: task?.totalCount || 0,
    summary: task ? getUploadSummary(task) : null
  };
}

function getUploadSummary(task: UploadTask): string {
  switch (task.status) {
    case 'pending':
      return 'Queued for upload...';
    case 'uploading':
      return `Uploading ${task.uploadedCount}/${task.totalCount} files...`;
    case 'completed':
      if (task.failedCount > 0) {
        return `${task.uploadedCount} uploaded, ${task.failedCount} failed`;
      }
      return `${task.uploadedCount} files uploaded`;
    case 'failed':
      return `Upload failed: ${task.error}`;
    default:
      return '';
  }
}