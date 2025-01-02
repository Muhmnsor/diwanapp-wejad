import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
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
        const photo = report.photos[i];
        if (!photo?.url) continue;

        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const extension = photo.url.split('.').pop()?.toLowerCase() || '';
          const fileName = `صورة_${i + 1}.${extension}`;
          imageFolder?.file(fileName, blob);
        } catch (error) {
          console.error('Error downloading image:', error);
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