import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { ProjectActivityReport } from '@/types/projectActivityReport';

export const downloadReportWithImages = async (report: ProjectActivityReport, eventTitle?: string): Promise<boolean> => {
  try {
    console.log('Starting report download process for:', report.id);
    const zip = new JSZip();

    // Add report text content
    const reportContent = generateReportContent(report);
    zip.file('report.txt', reportContent);

    // Download and add images if they exist
    if (report.photos && report.photos.length > 0) {
      console.log('Processing', report.photos.length, 'photos');
      const imageFolder = zip.folder('images');
      
      for (let i = 0; i < report.photos.length; i++) {
        const photoUrl = report.photos[i];
        try {
          const response = await fetch(photoUrl);
          const blob = await response.blob();
          const fileName = `image_${i + 1}${getFileExtension(photoUrl)}`;
          imageFolder?.file(fileName, blob);
        } catch (error) {
          console.error('Error downloading image:', photoUrl, error);
        }
      }
    }

    // Generate and save zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `${eventTitle || 'report'}_${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(content, fileName);
    
    console.log('Report download completed successfully');
    return true;
  } catch (error) {
    console.error('Error in downloadReportWithImages:', error);
    return false;
  }
};

const generateReportContent = (report: ProjectActivityReport): string => {
  return `
اسم التقرير: ${report.report_name}
اسم البرنامج: ${report.program_name || 'غير محدد'}

الوصف التفصيلي:
${report.detailed_description || 'لا يوجد وصف تفصيلي'}

مدة النشاط: ${report.activity_duration || 'غير محدد'}
عدد الحضور: ${report.attendees_count || 'غير محدد'}

أهداف النشاط:
${report.activity_objectives || 'لم يتم تحديد الأهداف'}

الأثر على المشاركين:
${report.impact_on_participants || 'لم يتم تحديد الأثر'}

نص التقرير:
${report.report_text || 'لا يوجد نص للتقرير'}
`;
};

const getFileExtension = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return `.${extension}`;
  }
  return '.jpg'; // Default extension
};