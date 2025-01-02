import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectReport, ReportPhoto } from '@/types/projectReport';
import { supabase } from '@/integrations/supabase/client';

const calculateAverageRatings = async (activityId: string) => {
  const { data: feedback } = await supabase
    .from('activity_feedback')
    .select('overall_rating, content_rating, organization_rating, presenter_rating')
    .eq('activity_id', activityId);

  if (!feedback || feedback.length === 0) {
    return null;
  }

  const calculateAverage = (ratings: (number | null)[]) => {
    const validRatings = ratings.filter((r): r is number => r !== null);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
  };

  return {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating))
  };
};

export const downloadReport = async (report: ProjectReport, title?: string): Promise<boolean> => {
  try {
    console.log('Starting report download process for:', report.id);
    const zip = new JSZip();

    // Get activity ratings
    const ratings = await calculateAverageRatings(report.activity_id || '');
    
    // Generate report content with ratings
    const reportContent = `تقرير النشاط
=================
اسم البرنامج: ${report.program_name || ''}
اسم التقرير: ${report.report_name || ''}
مدة النشاط: ${report.activity_duration || ''}
عدد الحضور: ${report.attendees_count || ''}
الأهداف: ${report.activity_objectives || ''}
الأثر على المشاركين: ${report.impact_on_participants || ''}
وصف تفصيلي: ${report.detailed_description || ''}
التقرير: ${report.report_text || ''}

متوسط التقييمات
==============
${ratings ? `
التقييم العام: ${ratings.overall.toFixed(1)} من 5
تقييم المحتوى: ${ratings.content.toFixed(1)} من 5
تقييم التنظيم: ${ratings.organization.toFixed(1)} من 5
تقييم المقدم: ${ratings.presenter.toFixed(1)} من 5
` : 'لا توجد تقييمات لهذا النشاط'}

الصور المرفقة
============
${report.photos && Array.isArray(report.photos) ? 
  report.photos.map((photo, index) => {
    try {
      const photoData: ReportPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
      return `${index + 1}. ${photoData.description || 'بدون وصف'}`;
    } catch (e) {
      console.error('Error parsing photo:', e);
      return `${index + 1}. صورة ${index + 1}`;
    }
  }).join('\n') 
  : 'لا توجد صور مرفقة'}`;

    // Add report text content
    zip.file('تقرير-النشاط.txt', reportContent);

    // Download and add images if they exist
    if (report.photos && Array.isArray(report.photos)) {
      console.log('Processing', report.photos.length, 'photos');
      const photosFolder = zip.folder('الصور');
      
      for (let i = 0; i < report.photos.length; i++) {
        try {
          let photoData: ReportPhoto;
          if (typeof report.photos[i] === 'string') {
            photoData = JSON.parse(report.photos[i] as string);
          } else {
            photoData = report.photos[i] as ReportPhoto;
          }

          if (!photoData?.url) continue;

          const response = await fetch(photoData.url);
          const blob = await response.blob();
          const extension = photoData.url.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `صورة_${i + 1}${photoData.description ? ` - ${photoData.description}` : ''}.${extension}`;
          photosFolder?.file(fileName, blob);
        } catch (error) {
          console.error(`Error downloading photo ${i + 1}:`, error);
        }
      }
    }

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