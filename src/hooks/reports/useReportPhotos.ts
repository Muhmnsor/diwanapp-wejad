
import { useState, useEffect } from "react";
import { ReportPhoto } from "@/types/projectReport";

export const useReportPhotos = (initialPhotos?: any[]) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(Array(6).fill(null));

  useEffect(() => {
    if (initialPhotos && Array.isArray(initialPhotos)) {
      const initialPhotoArray = Array(6).fill(null);
      
      initialPhotos.forEach((photo: any) => {
        try {
          // تحويل النص إلى كائن إذا كان نصياً
          const photoObj = typeof photo === 'string' ? JSON.parse(photo) : photo;
          
          if (photoObj && photoObj.url && typeof photoObj.index !== 'undefined') {
            initialPhotoArray[photoObj.index] = photoObj;
          }
        } catch (e) {
          console.error('Error parsing photo:', e);
        }
      });

      console.log('useReportPhotos - Initialized photos array:', initialPhotoArray);
      setPhotos(initialPhotoArray);
    }
  }, [initialPhotos]);

  return { photos, setPhotos };
};
