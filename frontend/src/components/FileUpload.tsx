import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '../lib/utils';
import axios from 'axios';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileId: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

const DEFAULT_ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOCUMENT_TYPES];

// Create API instance with the same configuration as main API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true
});

// Add the same request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function FileUpload({
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  disabled = false,
  existingFiles = []
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxFileSize) {
      return `File size must be less than ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`;
    }
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const tempFile: UploadedFile = {
      id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      isUploading: true,
      uploadProgress: 0
    };

    setFiles(prev => [...prev, tempFile]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles(prev => prev.map(f => 
              f.id === tempFile.id 
                ? { ...f, uploadProgress: progress }
                : f
            ));
          }
        }
      });

      const result = response.data;
      
      const uploadedFile: UploadedFile = {
        id: result.id || tempFile.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url || URL.createObjectURL(file),
        isUploading: false,
        uploadProgress: 100
      };

      setFiles(prev => prev.map(f => f.id === tempFile.id ? uploadedFile : f));
      return uploadedFile;
    } catch (error) {
      console.error('File upload error:', error);
      const errorFile: UploadedFile = {
        ...tempFile,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
      
      setFiles(prev => prev.map(f => f.id === tempFile.id ? errorFile : f));
      throw error;
    }
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError(null);
    const filesToUpload: File[] = Array.from(fileList);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files first
    for (const file of filesToUpload) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Upload valid files
    const uploadPromises = validFiles.map(uploadFile);
    
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      onFilesUploaded(uploadedFiles);
    } catch (error) {
      console.error('File upload error:', error);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedTypes, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return;
    
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
    
    if (files.length > 0) {
      e.preventDefault();
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      handleFiles(fileList.files);
    }
  }, [handleFiles, disabled]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemoved(fileId);
  };

  const getFileIcon = (type: string) => {
    if (ACCEPTED_IMAGE_TYPES.includes(type)) {
      return <Image className="h-4 w-4" />;
    }
    if (type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        onClick={() => !disabled && fileInputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Drop files here, click to browse, or paste images
          </p>
          <p className="text-xs text-muted-foreground">
            Images, PDFs, and documents up to {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-background"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  {file.isUploading && (
                    <div className="mt-1">
                      <Progress value={file.uploadProgress || 0} className="h-1" />
                    </div>
                  )}
                  
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {file.isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  ) : file.error ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={file.isUploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 