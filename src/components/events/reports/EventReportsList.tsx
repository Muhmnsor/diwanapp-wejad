import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportListContainer } from "./ReportListContainer";
import { ReportListHeader } from "./ReportListHeader";
import { ReportListItem } from "./ReportListItem";
import * as XLSX from 'xlsx';

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
    const ws = XLSX.utils.json_to_sheet([report]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report-${report.id}.xlsx`);
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