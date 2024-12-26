import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { ReportListItem } from "./ReportListItem";
import { ReportListHeader } from "./ReportListHeader";
import { ReportListContainer } from "./ReportListContainer";

interface EventReportsListProps {
  eventId: string;
}

export const EventReportsList = ({ eventId }: EventReportsListProps) => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['event-reports', eventId],
    queryFn: async () => {
      console.log('Fetching reports for event:', eventId);
      const { data, error } = await supabase
        .from('event_reports')
        .select(`
          *,
          executor:executor_id (
            id,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Reports fetched:', data);
      return data;
    },
  });

  const handleDownload = (report: any) => {
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Report Details
    const reportDetails = {
      "تاريخ التقرير": new Date(report.created_at).toLocaleDateString('ar'),
      "منفذ التقرير": report.executor?.email || 'غير محدد',
      "نص التقرير": report.report_text,
      "مستوى الرضا": report.satisfaction_level ? `${report.satisfaction_level}/5` : 'غير محدد',
    };
    const detailsSheet = XLSX.utils.json_to_sheet([reportDetails], { header: Object.keys(reportDetails) });
    XLSX.utils.book_append_sheet(workbook, detailsSheet, "تفاصيل التقرير");

    // Sheet 2: Media Links
    const mediaLinks = {
      "روابط الفيديو": report.video_links?.join("\n") || "لا يوجد",
      "روابط إضافية": report.additional_links?.join("\n") || "لا يوجد",
      "روابط الصور": report.photos?.join("\n") || "لا يوجد",
      "الملفات المرفقة": report.files?.join("\n") || "لا يوجد"
    };
    const mediaSheet = XLSX.utils.json_to_sheet([mediaLinks], { header: Object.keys(mediaLinks) });
    XLSX.utils.book_append_sheet(workbook, mediaSheet, "الوسائط والروابط");

    // Download the file
    XLSX.writeFile(workbook, `تقرير-الفعالية-${new Date(report.created_at).toLocaleDateString('ar')}.xlsx`);
  };

  return (
    <div className="space-y-4 mt-6">
      <ReportListHeader title="التقارير السابقة" />
      <ReportListContainer isLoading={isLoading} error={error}>
        {reports?.map((report) => (
          <ReportListItem
            key={report.id}
            report={report}
            onDownload={handleDownload}
          />
        ))}
      </ReportListContainer>
    </div>
  );
};