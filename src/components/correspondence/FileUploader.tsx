import React, { useState } from "react";
import { Upload, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  value?: File[];
  onChange?: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  value = [],
  onChange
}) => {
  const [files, setFiles] = useState<File[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setError(null);
    
    // التحقق من عدد الملفات
    if (files.length + newFiles.length > maxFiles) {
      setError(`يمكنك رفع ${maxFiles} ملفات كحد أقصى`);
      return;
    }
    
    const validFiles = newFiles.filter(file => {
      // التحقق من حجم الملف
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`الملف ${file.name} يتجاوز الحجم المسموح (${maxSizeMB} ميجابايت)`);
        return false;
      }
      
      // التحقق من نوع الملف
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedTypes.includes('*') && !acceptedTypes.includes(fileExtension)) {
        setError(`الملف ${file.name} ليس من الأنواع المسموح بها`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onChange && onChange(updatedFiles);
      
      // محاكاة تقدم الرفع لكل ملف
      validFiles.forEach(file => {
        let progress = 0;
        const fileId = `${file.name}-${Date.now()}`;
        
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: progress
          }));
          
          if (progress >= 100) {
            clearInterval(interval);
            setUploadProgress(prev => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });
          }
        }, 200);
      });
      
      // استدعاء وظيفة الرفع من الخارج
      onUpload(validFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onChange && onChange(newFiles);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-6 w-6 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
        />
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">اسحب وأفلت الملفات هنا أو انقر للاختيار</p>
        <p className="text-xs text-muted-foreground mt-1">
          يمكنك رفع حتى {maxFiles} ملفات بحجم أقصى {maxSizeMB} ميجابايت للملف
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          الأنواع المدعومة: {acceptedTypes.join(', ')}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">الملفات المرفوعة ({files.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getFileIcon(file.name)}
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[150px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} كيلوبايت</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">جاري الرفع...</p>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <p className="text-xs text-muted-foreground">{fileId.split('-')[0]}</p>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

