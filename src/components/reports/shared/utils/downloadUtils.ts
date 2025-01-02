import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ReportPhoto } from '../types';

interface BaseReport {
  report_name: string;
  program_name?: string | null;
  report_text: string;
  activity_duration?: string;
  attendees_count?: string | null;
  activity_objectives?: string;
  impact_on_participants?: string | null;
  photos?: ReportPhoto[];
  satisfaction_level?: number | null;
}

export const downloadReportWithImages = async (report: BaseReport, eventTitle?: string): Promise<boolean> => {
  try {
    console.log('Starting report download process for:', report.report_name);
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
          const fileName = `صورة_${i + 1}${getFileExtension(photo.url)}`;
          imageFolder?.file(fileName, blob);
        } catch (error) {
          console.error('Error downloading image:', error);
        }
      }
    }

    // Generate and save zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `تقرير-${eventTitle || report.report_name || 'النشاط'}-${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(content, fileName);
    
    console.log('Report download completed successfully');
    return true;
  } catch (error) {
    console.error('Error in downloadReportWithImages:', error);
    return false;
  }
};

const generateReportContent = (report: BaseReport): string => {
  const formatValue = (value: string | null | undefined): string => {
    return value || 'غير محدد';
  };

  const formatSatisfactionLevel = (level: number | null | undefined): string => {
    return level ? `${level}/5` : 'غير محدد';
  };

  const content = [
    `اسم البرنامج/المشروع: ${formatValue(report.program_name)}`,
    `اسم التقرير: ${formatValue(report.report_name)}`,
    `تقرير النشاط: ${formatValue(report.report_text)}`,
    `عدد الحضور: ${formatValue(report.attendees_count)}`,
    `مدة النشاط: ${formatValue(report.activity_duration)}`,
    `أهداف النشاط: ${formatValue(report.activity_objectives)}`,
    `الأثر على المشاركين: ${formatValue(report.impact_on_participants)}`,
    `متوسط نسبة التقييم للنشاط: ${formatSatisfactionLevel(report.satisfaction_level)}`
  ].join('\n\n');

  return content;
};

const getFileExtension = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return `.${extension}`;
  }
  return '';
};