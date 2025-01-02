import { ProjectReport } from '@/types/projectReport';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export const downloadProjectReport = async (report: ProjectReport, projectTitle?: string): Promise<boolean> => {
  try {
    const zip = new JSZip();
    
    // Add report text to a text file
    const reportContent = `
    اسم التقرير: ${report.report_name}
    اسم البرنامج: ${report.program_name || ''}
    مدة النشاط: ${report.activity_duration || ''}
    عدد الحضور: ${report.attendees_count || ''}
    الأهداف: ${report.objectives || ''}
    الأثر على المشاركين: ${report.impact_on_participants || ''}
    وصف تفصيلي: ${report.detailed_description || ''}
    التقرير: ${report.report_text || ''}
    `;
    
    zip.file('report.txt', reportContent);

    // Add photos if they exist
    if (report.photos && report.photos.length > 0) {
      const photosFolder = zip.folder('photos');
      
      for (let i = 0; i < report.photos.length; i++) {
        const photo = report.photos[i];
        if (photo && photo.url) {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            photosFolder.file(`photo_${i + 1}.jpg`, blob);
          } catch (error) {
            console.error(`Error downloading photo ${i + 1}:`, error);
          }
        }
      }
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a filename
    const filename = `${projectTitle ? projectTitle + '_' : ''}${report.report_name}.zip`;
    
    // Download the zip file
    saveAs(content, filename);
    
    return true;
  } catch (error) {
    console.error('Error downloading report:', error);
    return false;
  }
};