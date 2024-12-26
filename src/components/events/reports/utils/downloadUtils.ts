import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';

interface FeedbackSummary {
  averageOverallRating: number;
  averageContentRating: number;
  averageOrganizationRating: number;
  averagePresenterRating: number;
  totalFeedbacks: number;
}

const fetchFeedbackSummary = async (eventId: string): Promise<FeedbackSummary> => {
  console.log('Fetching feedback summary for event:', eventId);
  
  const { data: feedbacks, error } = await supabase
    .from('event_feedback')
    .select('overall_rating, content_rating, organization_rating, presenter_rating')
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }

  if (!feedbacks.length) {
    return {
      averageOverallRating: 0,
      averageContentRating: 0,
      averageOrganizationRating: 0,
      averagePresenterRating: 0,
      totalFeedbacks: 0
    };
  }

  const sum = feedbacks.reduce((acc, feedback) => ({
    overall: acc.overall + (feedback.overall_rating || 0),
    content: acc.content + (feedback.content_rating || 0),
    organization: acc.organization + (feedback.organization_rating || 0),
    presenter: acc.presenter + (feedback.presenter_rating || 0)
  }), { overall: 0, content: 0, organization: 0, presenter: 0 });

  return {
    averageOverallRating: sum.overall / feedbacks.length,
    averageContentRating: sum.content / feedbacks.length,
    averageOrganizationRating: sum.organization / feedbacks.length,
    averagePresenterRating: sum.presenter / feedbacks.length,
    totalFeedbacks: feedbacks.length
  };
};

export const downloadReportWithImages = async (
  report: Report,
  eventTitle?: string
) => {
  try {
    const zip = new JSZip();
    
    const feedbackSummary = await fetchFeedbackSummary(report.event_id);
    console.log('Feedback summary:', feedbackSummary);

    // Parse photos array and ensure it's an array of objects
    const parsedPhotos = report.photos.map(photo => {
      if (typeof photo === 'string') {
        try {
          return JSON.parse(photo);
        } catch {
          return { url: photo, description: '' };
        }
      }
      return photo;
    });

    console.log('Parsed photos:', parsedPhotos);

    const reportContent = `تقرير الفعالية

اسم البرنامج: ${report.program_name || 'غير محدد'}
اسم الفعالية: ${report.report_name || eventTitle || 'غير محدد'}
التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description || ''}

معلومات الفعالية:
- المدة: ${report.event_duration || 'غير محدد'}
- عدد المشاركين: ${report.attendees_count || 'غير محدد'}

الأهداف:
${report.event_objectives || 'غير محدد'}

الأثر على المشاركين:
${report.impact_on_participants || 'غير محدد'}

ملخص التقييمات:
- عدد التقييمات: ${feedbackSummary.totalFeedbacks}
- متوسط التقييم العام: ${feedbackSummary.averageOverallRating.toFixed(1)} / 5
- متوسط تقييم المحتوى: ${feedbackSummary.averageContentRating.toFixed(1)} / 5
- متوسط تقييم التنظيم: ${feedbackSummary.averageOrganizationRating.toFixed(1)} / 5
- متوسط تقييم المقدم: ${feedbackSummary.averagePresenterRating.toFixed(1)} / 5

الصور المرفقة:
${parsedPhotos.map((photo, index) => `${index + 1}. ${photo.description || `صورة ${index + 1}`}`).join('\n')}`;

    zip.file('تقرير-الفعالية.txt', reportContent);

    const imagesFolder = zip.folder("الصور");
    if (!imagesFolder) throw new Error('Failed to create images folder');

    const downloadPromises = parsedPhotos.map(async (photo, index) => {
      if (!photo.url) {
        console.log(`Skipping empty photo at index ${index}`);
        return;
      }

      try {
        console.log(`Downloading image ${index + 1}:`, photo.url);
        const response = await fetch(photo.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const extension = photo.url.split('.').pop() || 'jpg';
        const fileName = `صورة-${index + 1}-${photo.description || ''}.${extension}`;
        
        console.log(`Adding image to zip:`, fileName);
        imagesFolder.file(fileName, blob);
      } catch (error) {
        console.error(`Error downloading image ${index}:`, error);
      }
    });

    await Promise.all(downloadPromises);

    console.log('Generating zip file...');
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-${report.report_name || eventTitle || 'الفعالية'}-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed successfully');
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
};