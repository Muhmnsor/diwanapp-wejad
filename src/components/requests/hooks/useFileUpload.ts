
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

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

  // Upload a single file to Supabase storage
  const uploadFile = async (file: File, userId: string): Promise<{ url: string; path: string; name: string; type: string; size: number } | null> => {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('request-attachments')
        .upload(filePath, file);
      
      if (error) {
        console.error(`Error uploading file:`, error);
        throw new Error(`فشل في رفع الملف: ${error.message}`);
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('request-attachments')
        .getPublicUrl(filePath);
      
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
    const processedData = { ...formData };
    const uploadPromises = [];
    const fileFields = [];

    try {
      // Identify file fields and prepare uploads
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
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
        const results = await Promise.all(uploadPromises);
        
        // Check for any failed uploads
        const failedUploads = results.filter(result => !result.success);
        if (failedUploads.length > 0) {
          const errors = failedUploads.map(fail => `حقل "${fail.field}": ${fail.error?.message || 'خطأ غير معروف'}`);
          throw new Error(`فشل في رفع بعض الملفات: ${errors.join(', ')}`);
        }
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
    processFormFiles,
    uploadFile,
    validateFile
  };
};
