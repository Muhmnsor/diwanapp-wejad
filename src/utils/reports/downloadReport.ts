import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectReport } from '@/types/projectReport';
import { generateReportContent } from './formatReportContent';
import { downloadAndZipPhotos } from './downloadFiles';

export const downloadProjectReport = async (report: ProjectReport, title?: string): Promise<boolean> => {
  try {
    console.log('Starting report download process for:', report.id);
    const zip = new JSZip();

    // Add report text content
    const reportContent = generateReportContent(report);
    zip.file('تقرير-النشاط.txt', reportContent);

    // Download and add images if they exist
    await downloadAndZipPhotos(zip, report.photos);

    // Generate and save zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `تقرير-${title || report.report_name || 'النشاط'}-${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(content, fileName);
    
    console.log('Report download completed successfully');
    return true;
  } catch (error) {
    console.error('Error in downloadReport:', error);
    return false;
  }
};