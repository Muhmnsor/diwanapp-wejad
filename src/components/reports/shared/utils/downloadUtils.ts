import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ReportPhoto } from '../types';

interface BaseReport {
  report_name: string;
  program_name?: string | null;
  report_text: string;
  detailed_description?: string | null;
  activity_duration?: string;
  attendees_count?: string | null;
  activity_objectives?: string;
  impact_on_participants?: string | null;
  photos?: ReportPhoto[];
  video_links?: string[];
  additional_links?: string[];
  comments?: string[];
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
    if (!value || value.trim() === '') return 'لا يوجد';
    return value;
  };

  const formatSatisfactionLevel = (level: number | null | undefined): string => {
    if (!level && level !== 0) return 'غير محدد';
    return `${level}/5`;
  };

  const formatLinks = (links?: string[]): string => {
    if (!links || links.length === 0) return 'لا يوجد روابط';
    return links.join('\n');
  };

  const formatComments = (comments?: string[]): string => {
    if (!comments || comments.length === 0) return 'لا يوجد تعليقات';
    return comments.join('\n');
  };

  // Order matches the form exactly with proper spacing
  const sections = [
    {
      title: 'اسم التقرير',
      value: formatValue(report.report_name)
    },
    {
      title: 'اسم البرنامج',
      value: formatValue(report.program_name)
    },
    {
      title: 'الوصف التفصيلي',
      value: formatValue(report.detailed_description)
    },
    {
      title: 'مدة النشاط',
      value: formatValue(report.activity_duration)
    },
    {
      title: 'عدد الحضور',
      value: formatValue(report.attendees_count)
    },
    {
      title: 'أهداف النشاط',
      value: formatValue(report.activity_objectives)
    },
    {
      title: 'الأثر على المشاركين',
      value: formatValue(report.impact_on_participants)
    },
    {
      title: 'نص التقرير',
      value: formatValue(report.report_text)
    },
    {
      title: 'روابط الفيديو',
      value: formatLinks(report.video_links)
    },
    {
      title: 'روابط إضافية',
      value: formatLinks(report.additional_links)
    },
    {
      title: 'تعليقات',
      value: formatComments(report.comments)
    },
    {
      title: 'مستوى الرضا',
      value: formatSatisfactionLevel(report.satisfaction_level)
    }
  ];

  // Add double line breaks between sections for better readability
  return sections
    .map(section => `${section.title}:\n${section.value}`)
    .join('\n\n');
};

const getFileExtension = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return `.${extension}`;
  }
  return '';
};