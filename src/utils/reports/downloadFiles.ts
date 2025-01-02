import JSZip from 'jszip';
import { ReportPhoto } from '@/types/projectReport';

export const getFileExtension = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return `.${extension}`;
  }
  return '';
};

export const downloadAndZipPhotos = async (
  zip: JSZip,
  photos: ReportPhoto[] | null | undefined
): Promise<void> => {
  if (!photos || photos.length === 0) return;

  console.log('Processing', photos.length, 'photos');
  const imageFolder = zip.folder('الصور');
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo?.url) continue;

    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const fileName = `صورة_${i + 1}${getFileExtension(photo.url)}`;
      imageFolder?.file(fileName, blob);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }
};