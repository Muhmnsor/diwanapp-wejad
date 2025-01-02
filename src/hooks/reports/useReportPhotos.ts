import { useState, useEffect } from 'react';
import { ReportPhoto } from '@/types/projectReport';

export const useReportPhotos = (initialReport?: any) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(Array(6).fill(null));

  useEffect(() => {
    if (initialReport?.photos && Array.isArray(initialReport.photos)) {
      const initialPhotos = Array(6).fill(null);
      
      initialReport.photos.forEach((photoStr: string, index: number) => {
        try {
          const photo = JSON.parse(photoStr);
          if (photo && photo.url) {
            initialPhotos[index] = photo;
          }
        } catch (e) {
          console.error('Error parsing photo:', e);
        }
      });

      console.log('useReportPhotos - Initialized photos array:', initialPhotos);
      setPhotos(initialPhotos);
    }
  }, [initialReport]);

  const preparePhotosForSubmission = () => {
    return photos
      .map((photo, index) => {
        if (photo && photo.url) {
          return JSON.stringify({ ...photo, index });
        }
        return null;
      })
      .filter(Boolean);
  };

  return {
    photos,
    setPhotos,
    preparePhotosForSubmission
  };
};