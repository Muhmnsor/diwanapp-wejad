
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to validate a file before upload
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `حجم الملف ${file.name} يتجاوز الحد المسموح به (10 ميجابايت)` 
      };
    }
    
    // Additional validations can be added here
    return { valid: true };
  };

  // Upload a single file to Supabase storage with progress tracking
  const uploadFile = async (file: File, userId: string): Promise<{ url: string; path: string; name: string; type: string; size: number } | null> => {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      console.log(`Starting upload for file: ${file.name}, size: ${file.size} bytes`);

      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Check if storage bucket exists first
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'request-attachments');
      
      if (!bucketExists) {
        console.log('Creating request-attachments bucket');
        const { error: createError } = await supabase.storage.createBucket('request-attachments', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          throw new Error(`فشل في إنشاء مجلد التخزين: ${createError.message}`);
        }
      }

      // Create a custom upload handler with progress tracking
      const { data, error } = await supabase.storage
        .from('request-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
            console.log(`Upload progress for ${file.name}: ${percent}%`);
          }
        });
      
      if (error) {
        console.error(`Error uploading file:`, error);
        throw new Error(`فشل في رفع الملف: ${error.message}`);
      }
      
      console.log(`File uploaded successfully: ${filePath}`);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('request-attachments')
        .getPublicUrl(filePath);
      
      console.log(`File public URL: ${publicUrl}`);
      
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  };

  // Process all files in form data
  const processFormFiles = async (formData: Record<string, any>, userId: string): Promise<Record<string, any>> => {
    setIsUploading(true);
    setUploadProgress(0);
    const processedData = { ...formData };
    const uploadPromises = [];
    const fileFields = [];

    try {
      console.log('Starting to process form files');
      
      // Identify file fields and prepare uploads
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
          console.log(`Found file field: ${key}, file: ${value.name}`);
          fileFields.push(key);
          uploadPromises.push(
            uploadFile(value, userId)
              .then(fileData => {
                if (fileData) {
                  processedData[key] = fileData;
                }
                return { field: key, success: true };
              })
              .catch(error => {
                return { field: key, success: false, error };
              })
          );
        }
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        console.log(`Uploading ${uploadPromises.length} files...`);
        const results = await Promise.all(uploadPromises);
        
        // Check for any failed uploads
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
          const errors = failedUploads.map(fail => `حقل "${fail.field}": ${fail.error?.message || 'خطأ غير معروف'}`);
          throw new Error(`فشل في رفع بعض الملفات: ${errors.join(', ')}`);
        }
      } else {
        console.log('No files to upload');
      }

      return processedData;
    } catch (error) {
      console.error('Error processing form files:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    processFormFiles,
    uploadFile,
    validateFile
  };
};
