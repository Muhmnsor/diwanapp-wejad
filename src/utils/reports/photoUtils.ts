
import { ReportPhoto } from '@/types/projectReport';
import { photoPlaceholders } from './constants';

export async function fetchImageAsBlob(url: string): Promise<Blob> {
  try {
    console.log('Attempting to fetch image from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch image:', response.statusText);
      throw new Error(`Failed to fetch image: ${url} (${response.status})`);
    }
    const blob = await response.blob();
    console.log('Successfully fetched image, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error in fetchImageAsBlob:', error);
    throw error;
  }
}

export function getImageFileName(photo: ReportPhoto): string {
  const description = photo.index !== undefined ? photoPlaceholders[photo.index] : 'صورة إضافية';
  const sanitizedDescription = description
    .replace(/[^\u0621-\u064A0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${(photo.index !== undefined ? photo.index + 1 : 0).toString().padStart(2, '0')}-${sanitizedDescription}.jpg`;
}

export function parsePhotos(photos: any[]): ReportPhoto[] {
  return photos.map(photo => {
    if (typeof photo === 'string') {
      try {
        return JSON.parse(photo);
      } catch (e) {
        console.error('Error parsing photo JSON:', e);
        return null;
      }
    }
    return photo;
  }).filter(Boolean);
}
