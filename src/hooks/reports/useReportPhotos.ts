import { useState, useEffect } from "react";
import { ReportPhoto } from "@/types/projectReport";

export const useReportPhotos = (initialPhotos?: any[]) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(Array(6).fill(null));

  useEffect(() => {
    if (initialPhotos && Array.isArray(initialPhotos)) {
      const initialPhotoArray = Array(6).fill(null);
      
      initialPhotos.forEach((photoStr: string, index: number) => {
        try {
          const photo = JSON.parse(photoStr);
          if (photo && photo.url) {
            initialPhotoArray[index] = photo;
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