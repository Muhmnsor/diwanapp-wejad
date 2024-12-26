import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportListContainer } from "./ReportListContainer";
import { ReportListHeader } from "./ReportListHeader";
import { ReportListItem } from "./ReportListItem";

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
          profiles:executor_id (
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
    // Create report content
    const reportContent = `
تقرير الفعالية

التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description}

معلومات الفعالية:
- مدة الفعالية: ${report.event_duration}
- عدد المشاركين: ${report.attendees_count}

الأهداف:
${report.event_objectives}

الأثر على المشاركين:
${report.impact_on_participants}

الصور المرفقة:
${report.photos?.map((photo: any) => `- ${photo.description}: ${photo.url}`).join('\n') || 'لا توجد صور مرفقة'}
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الفعالية-${new Date(report.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ReportListContainer isLoading={isLoading} error={error}>
      <ReportListHeader title="تقارير الفعالية" />
      {reports?.map((report) => (
        <ReportListItem 
          key={report.id} 
          report={report} 
          onDownload={handleDownload}
        />
      ))}
    </ReportListContainer>
  );
};