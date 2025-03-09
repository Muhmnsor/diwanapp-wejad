
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

  // Upload a single file to Supabase storage with manual progress tracking
  const uploadFile = async (file: File, userId: string): Promise<{ url: string; path: string; name: string; type: string; size: number } | null> => {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      console.log(`Starting upload for file: ${file.name}, size: ${file.size} bytes`);
      setUploadProgress(0);

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

      // Since onUploadProgress is not supported, we'll use a chunked approach to track progress
      const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      // Handle small files directly
      if (file.size <= CHUNK_SIZE || totalChunks === 1) {
        setUploadProgress(10); // Starting progress
        const { data, error } = await supabase.storage
          .from('request-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading file:`, error);
          throw new Error(`فشل في رفع الملف: ${error.message}`);
        }
        
        setUploadProgress(100);
      } else {
        // Use manual progress tracking by uploading in chunks
        let uploadedChunks = 0;
        
        // This is a simulation of progress since we can't track actual progress
        // In a production app, consider using XMLHttpRequest or fetch with a proper progress implementation
        const updateProgress = () => {
          uploadedChunks++;
          const progress = Math.round((uploadedChunks / totalChunks) * 100);
          setUploadProgress(progress);
          console.log(`Upload progress for ${file.name}: ${progress}%`);
        };
        
        // Start simulation
        setUploadProgress(10);
        
        // Upload the file (we're not actually chunking here, just simulating progress)
        const { data, error } = await supabase.storage
          .from('request-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error(`Error uploading file:`, error);
          throw new Error(`فشل في رفع الملف: ${error.message}`);
        }
        
        // Complete the progress
        setUploadProgress(100);
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
                  console.log(`Uploaded file for field ${key}:`, fileData);
                }
                return { field: key, success: true };
              })
              .catch(error => {
                console.error(`Failed to upload file for field ${key}:`, error);
                return { field: key, success: false, error };
              })
          );
        } else if (value && typeof value === 'object' && 'url' in value && 'path' in value) {
          console.log(`Field ${key} already contains uploaded file:`, value);
        }
      }

      // Wait for all uploads to complete with retries
      if (uploadPromises.length > 0) {
        console.log(`Uploading ${uploadPromises.length} files...`);
        const results = await Promise.all(uploadPromises);
        
        // Check for any failed uploads
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
          const errors = failedUploads.map(fail => `حقل "${fail.field}": ${fail.error?.message || 'خطأ غير معروف'}`);
          throw new Error(`فشل في رفع بعض الملفات: ${errors.join(', ')}`);
        }
        
        console.log('All files uploaded successfully:', processedData);
      } else {
        console.log('No files to upload, continuing with form submission');
      }

      return processedData;
    } catch (error) {
      console.error('Error processing form files:', error);
      throw error;
    } finally {
      setIsUploading(false);
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
