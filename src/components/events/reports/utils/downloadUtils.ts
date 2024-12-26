import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

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
  report: {
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    created_at: string;
    photos: Array<{ url: string; description: string }>;
    event_id: string;
  },
  eventTitle?: string
) => {
  try {
    const zip = new JSZip();
    
    // Fetch feedback summary
    const feedbackSummary = await fetchFeedbackSummary(report.event_id);
    console.log('Feedback summary:', feedbackSummary);

    // Create report text content with feedback summary
    const reportContent = `تقرير الفعالية
${eventTitle ? `اسم الفعالية: ${eventTitle}` : ''}
التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description}

معلومات الفعالية:
- المدة: ${report.event_duration}
- عدد المشاركين: ${report.attendees_count}

الأهداف:
${report.event_objectives}

الأثر على المشاركين:
${report.impact_on_participants}

ملخص التقييمات:
- عدد التقييمات: ${feedbackSummary.totalFeedbacks}
- متوسط التقييم العام: ${feedbackSummary.averageOverallRating.toFixed(1)} / 5
- متوسط تقييم المحتوى: ${feedbackSummary.averageContentRating.toFixed(1)} / 5
- متوسط تقييم التنظيم: ${feedbackSummary.averageOrganizationRating.toFixed(1)} / 5
- متوسط تقييم المقدم: ${feedbackSummary.averagePresenterRating.toFixed(1)} / 5

الصور المرفقة:
${report.photos.map((photo, index) => `${index + 1}. ${photo.description || `صورة ${index + 1}`}`).join('\n')}`;

    // Add report text file
    zip.file('تقرير-الفعالية.txt', reportContent);

    // Create images folder
    const imagesFolder = zip.folder("الصور");
    if (!imagesFolder) throw new Error('Failed to create images folder');

    // Download and add images
    const downloadPromises = report.photos.map(async (photo, index) => {
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

    // Generate and download zip file
    console.log('Generating zip file...');
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الفعالية-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
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