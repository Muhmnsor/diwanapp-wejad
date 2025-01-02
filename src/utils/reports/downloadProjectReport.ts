import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectReport, ReportPhoto } from '@/types/projectReport';
import { generateReportContent } from './formatReportContent';

export const downloadProjectReport = async (report: ProjectReport): Promise<void> => {
  try {
    console.log('Starting report download process for:', report.id);
    const zip = new JSZip();

    // Add report text content
    const reportContent = generateReportContent(report);
    zip.file('تقرير-النشاط.txt', reportContent);

    // Download and add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing', report.photos.length, 'photos');
      const imageFolder = zip.folder('الصور');
      
      for (let i = 0; i < report.photos.length; i++) {
        try {
          const photo = report.photos[i];
          let photoUrl: string;

          if (typeof photo === 'string') {
            const parsedPhoto = JSON.parse(photo) as ReportPhoto;
            photoUrl = parsedPhoto.url;
          } else {
            photoUrl = photo.url;
          }

          if (!photoUrl) continue;

          console.log(`Downloading image from ${photoUrl}`);
          const response = await fetch(photoUrl);
          const blob = await response.blob();
          const extension = photoUrl.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `صورة_${i + 1}.${extension}`;
          imageFolder?.file(fileName, blob);
          console.log(`Successfully added ${fileName} to zip`);
        } catch (error) {
          console.error('Error processing photo:', error);
        }
      }
    }

    // Generate and save zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `تقرير-${report.report_name || 'النشاط'}-${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(content, fileName);
    
    console.log('Report download completed successfully');
  } catch (error) {
    console.error('Error in downloadReport:', error);
    throw new Error('حدث خطأ أثناء تحميل التقرير');
  }
};