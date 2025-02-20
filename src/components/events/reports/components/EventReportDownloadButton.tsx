
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadEventReport } from "@/utils/reports/downloadEventReport";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { photoPlaceholders } from "@/utils/reports/constants";

interface EventReportDownloadButtonProps {
  report: any;
}

export const EventReportDownloadButton = ({ report }: EventReportDownloadButtonProps) => {
  // جلب بيانات التقييم
  const { data: feedback = [] } = useQuery({
    queryKey: ['event-feedback', report.event_id],
    queryFn: async () => {
      console.log('Fetching feedback for report download:', report.event_id);
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', report.event_id);

      if (error) throw error;
      return data || [];
    }
  });

  const handleDownload = async () => {
    try {
      // حساب متوسطات التقييم
      const validFeedback = feedback.filter(f => f.overall_rating !== null);
      const avgRatings = {
        overall_rating: validFeedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / (validFeedback.length || 1),
        content_rating: validFeedback.reduce((sum, f) => sum + (f.content_rating || 0), 0) / (validFeedback.length || 1),
        organization_rating: validFeedback.reduce((sum, f) => sum + (f.organization_rating || 0), 0) / (validFeedback.length || 1),
        presenter_rating: validFeedback.reduce((sum, f) => sum + (f.presenter_rating || 0), 0) / (validFeedback.length || 1),
      };

      // تجميع انطباعات المشاركين
      const feedbackTexts = feedback
        .filter(f => f.feedback_text)
        .map(f => `- ${f.feedback_text}`)
        .join('\n');

      // معالجة الصور وأوصافها
      const processedPhotos = report.photos?.map((photo: any, index: number) => {
        let url: string;
        if (typeof photo === 'string') {
          try {
            const parsed = JSON.parse(photo);
            url = parsed.url;
          } catch {
            url = photo;
          }
        } else if (photo && typeof photo === 'object') {
          url = photo.url;
        } else {
          url = '';
        }

        return {
          url,
          description: photoPlaceholders[index] || `صورة ${index + 1}`,
          index
        };
      }).filter((photo: any) => photo.url) || [];

      // دمج البيانات مع التقرير
      const enrichedReport = {
        ...report,
        evaluators_count: validFeedback.length,
        content_rating: Math.round(avgRatings.content_rating),
        organization_rating: Math.round(avgRatings.organization_rating),
        presenter_rating: Math.round(avgRatings.presenter_rating),
        satisfaction_level: Math.round(avgRatings.overall_rating),
        feedback_text: feedbackTexts || 'لا توجد انطباعات مسجلة',
        photos: processedPhotos,
        photo_descriptions: processedPhotos.map(p => p.description)
      };

      await downloadEventReport(enrichedReport);
      toast.success('جاري تحميل التقرير');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleDownload}
      title="تنزيل التقرير"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};
