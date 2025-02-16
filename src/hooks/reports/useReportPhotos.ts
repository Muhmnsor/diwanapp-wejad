
import { useState, useEffect } from "react";
import { ReportPhoto } from "@/types/projectReport";

export const useReportPhotos = (initialPhotos?: any[]) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(Array(6).fill(null));

  useEffect(() => {
    if (initialPhotos && Array.isArray(initialPhotos)) {
      console.log('Initial photos received:', initialPhotos);
      
      const initialPhotoArray = Array(6).fill(null);
      
      initialPhotos.forEach((photo: any) => {
        try {
          // تحويل النص إلى كائن إذا كان نصياً
          let photoObj: ReportPhoto;
          
          if (typeof photo === 'string') {
            photoObj = JSON.parse(photo);
          } else {
            photoObj = photo;
          }
          
          if (photoObj && photoObj.url && typeof photoObj.index !== 'undefined') {
            console.log('Processing photo:', photoObj);
            initialPhotoArray[photoObj.index] = {
              url: photoObj.url,
              description: photoObj.description || '',
              index: photoObj.index
            };
          }
        } catch (e) {
          console.error('Error processing photo:', e);
        }
      });

      console.log('Final photos array:', initialPhotoArray);
      setPhotos(initialPhotoArray);
    }
  }, [initialPhotos]);

  return { photos, setPhotos };
};
