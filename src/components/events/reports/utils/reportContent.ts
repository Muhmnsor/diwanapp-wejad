import { EventReport } from "@/types/eventReport";
import { FeedbackSummary } from "./types";

export const generateReportContent = (
  report: EventReport,
  eventTitle: string | undefined,
  feedbackSummary: FeedbackSummary,
  photos: { url: string; description: string; }[]
) => {
  return `تقرير الفعالية

اسم البرنامج: ${report.program_name || 'غير محدد'}
اسم الفعالية: ${report.report_name || eventTitle || 'غير محدد'}
التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description || ''}

معلومات الفعالية:
- المدة: ${report.duration || 'غير محدد'}
- عدد المشاركين: ${report.attendees_count || 'غير محدد'}

الأهداف:
${report.objectives || 'غير محدد'}

الأثر على المشاركين:
${report.impact_on_participants || 'غير محدد'}

ملخص التقييمات:
- عدد التقييمات: ${feedbackSummary.totalFeedbacks}
- متوسط التقييم العام: ${feedbackSummary.averageOverallRating.toFixed(1)} / 5
- متوسط تقييم المحتوى: ${feedbackSummary.averageContentRating.toFixed(1)} / 5
- متوسط تقييم التنظيم: ${feedbackSummary.averageOrganizationRating.toFixed(1)} / 5
- متوسط تقييم المقدم: ${feedbackSummary.averagePresenterRating.toFixed(1)} / 5

الصور المرفقة:
${photos.map((photo, index) => `${index + 1}. ${photo.description || `صورة ${index + 1}`}`).join('\n')}`;
};