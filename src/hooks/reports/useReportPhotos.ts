import { useState } from 'react';
import { ReportPhoto } from '@/types/projectReport';

export const useReportPhotos = (initialPhotos?: any) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(
    initialPhotos ? parseInitialPhotos(initialPhotos) : Array(6).fill(null)
  );

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

const parseInitialPhotos = (report: any) => {
  const initialPhotos = Array(6).fill(null);
  
  if (report.photos && Array.isArray(report.photos)) {
    report.photos.forEach((photoStr: string, index: number) => {
      try {
        const photo = JSON.parse(photoStr);
        if (photo && photo.url) {
          initialPhotos[index] = photo;
        }
      } catch (e) {
        console.error('Error parsing photo:', e);
      }
    });
  }

  return initialPhotos;
};