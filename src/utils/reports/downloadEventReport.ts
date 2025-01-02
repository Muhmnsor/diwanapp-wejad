import { saveAs } from "file-saver";
import JSZip from 'jszip';
import { EventReport } from "@/types/report";

export const downloadEventReport = async (report: EventReport): Promise<void> => {
  try {
    console.log('Starting event report download process');
    const zip = new JSZip();

    // Add report content
    let content = '';
    content += `اسم التقرير: ${report.report_name}\n`;
    content += `تاريخ الفعالية: ${report.created_at}\n`;
    content += `تقرير الفعالية: ${report.report_text}\n`;
    content += `عدد الحضور: ${report.attendees_count}\n`;
    content += `مدة الفعالية: ${report.duration}\n`;
    content += `أهداف الفعالية: ${report.objectives}\n`;
    content += `آثار الفعالية: ${report.impact_on_participants || ''}\n`;

    zip.file('تقرير-الفعالية.txt', content);

    // Add photos if they exist
    if (report.photos && report.photos.length > 0) {
      const imageFolder = zip.folder('الصور');
      
      for (let i = 0; i < report.photos.length; i++) {
        try {
          const photoData = typeof report.photos[i] === 'string' 
            ? JSON.parse(report.photos[i]) 
            : report.photos[i];

          if (!photoData?.url) continue;

          const response = await fetch(photoData.url);
          const blob = await response.blob();
          const extension = photoData.url.split('.').pop()?.toLowerCase() || '';
          const fileName = `صورة_${i + 1}.${extension}`;
          imageFolder?.file(fileName, blob);
        } catch (error) {
          console.error('Error processing photo:', error);
          continue;
        }
      }
    }

    // Generate and save zip file
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const fileName = `تقرير-${report.report_name}-${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(zipContent, fileName);

    console.log('Event report download completed successfully');
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('حدث خطأ أثناء تحميل التقرير');
  }
};