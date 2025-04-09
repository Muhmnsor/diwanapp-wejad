// المسار: src/components/ui/file-uploader.tsx

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, AlertCircle, Check, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileUploaderProps = {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  className?: string;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndProcessFiles(files);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndProcessFiles = (files: File[]) => {
    setError(null);
    
    // Check number of files
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`لا يمكن رفع أكثر من ${maxFiles} ملفات`);
      return;
    }
    
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSizeBytes) {
        setError(`الملف ${file.name} أكبر من الحجم المسموح (${maxSizeMB} ميجابايت)`);
        continue;
      }
      
      // Check file type
      const fileType = file.type;
      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(fileType)) {
        setError(`نوع الملف ${file.name} غير مدعوم. الأنواع المدعومة: ${acceptedFileTypes.join(', ')}`);
        continue;
      }
      
      validFiles.push(file);
      
      // Initialize progress
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      
      // Simulate upload progress - in real app, this would be replaced with actual upload logic
      simulateProgress(file.name);
    }
    
    if (validFiles.length > 0) {
      const newSelectedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newSelectedFiles);
      onFilesSelected(validFiles);
    }
  };
  
  const simulateProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 200);
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      validateAndProcessFiles(files);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag and drop area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors text-center cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(',')}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">اسحب وأفلت الملفات هنا</h3>
          <p className="text-sm text-muted-foreground">
            أو انقر لتحديد الملفات (الحد الأقصى: {maxFiles} ملفات، {maxSizeMB} ميجابايت لكل ملف)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            الأنواع المدعومة: {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')}
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md flex items-center space-x-2 space-x-reverse">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">الملفات المحددة ({selectedFiles.length}/{maxFiles})</p>
          
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  {uploadProgress[file.name] === 100 ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : null}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">إزالة</span>
                  </Button>
                </div>
              </div>
              
              {uploadProgress[file.name] < 100 && (
                <Progress className="h-1 mt-2" value={uploadProgress[file.name]} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

