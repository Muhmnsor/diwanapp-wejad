import { useState } from 'react';
import { handleImageUpload } from '@/components/events/form/EventImageUpload';
import { toast } from 'sonner';
import { ReportPhoto } from '@/components/reports/shared/types';

export const useReportPhotos = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File): Promise<ReportPhoto | null> => {
    try {
      setIsUploading(true);
      console.log('Uploading photo for report');
      
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      
      if (error) {
        console.error('Error uploading photo:', error);
        throw error;
      }
      
      console.log('Photo uploaded successfully:', publicUrl);
      return { url: publicUrl, description: '' };
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoUrl: string) => {
    // Implementation for deleting photos if needed
    console.log('Deleting photo:', photoUrl);
    return true;
  };

  return {
    isUploading,
    uploadPhoto,
    deletePhoto
  };
};