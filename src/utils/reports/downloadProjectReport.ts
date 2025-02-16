
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import JSZip from 'jszip';
import { fetchImageAsBlob, getImageFileName, parsePhotos } from './photoUtils';
import { generateReportText } from './reportTextGenerator';

export const downloadProjectReport = async (report: ProjectReport): Promise<void> => {
  try {
    console.log('Starting report download process for:', report);
    const zip = new JSZip();
    
    // Add report text file
    const reportContent = generateReportText(report);
    zip.file('التقرير.txt', reportContent);
    console.log('Added report text to zip');
    
    // Create images folder
    const imagesFolder = zip.folder('الصور');
    if (!imagesFolder) {
      throw new Error('Failed to create images folder in zip');
    }
    
    // Parse and add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing photos:', report.photos.length, 'photos found');
      
      const parsedPhotos = parsePhotos(report.photos);
      console.log('Valid photos to process:', parsedPhotos.length);

      const sortedPhotos = [...parsedPhotos].sort((a, b) => {
        const indexA = a.index !== undefined ? a.index : Number.MAX_SAFE_INTEGER;
        const indexB = b.index !== undefined ? b.index : Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
      });

      const imagePromises = sortedPhotos.map(async (photo) => {
        if (photo && photo.url) {
          try {
            console.log(`Processing image with index ${photo.index}:`, photo.url);
            const imageBlob = await fetchImageAsBlob(photo.url);
            const fileName = getImageFileName(photo);
            console.log('Adding image to zip:', fileName, 'size:', imageBlob.size);
            imagesFolder.file(fileName, imageBlob);
          } catch (error) {
            console.error(`Failed to process image:`, error);
          }
        }
      });
      
      await Promise.all(imagePromises);
      console.log('Finished processing all images');
    } else {
      console.log('No photos found in report');
    }
    
    // Generate zip file
    console.log('Generating final zip file');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Generate filename based on activity title and date
    const date = new Date().toISOString().split('T')[0];
    const activityTitle = report.activity?.title || 'نشاط';
    const filename = `تقرير-${activityTitle}-${date}.zip`;
    
    // Download the zip file
    console.log('Initiating download of:', filename);
    saveAs(zipBlob, filename);
    console.log('Download initiated successfully');
  } catch (error) {
    console.error('Error in downloadProjectReport:', error);
    throw new Error('Failed to download report: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
