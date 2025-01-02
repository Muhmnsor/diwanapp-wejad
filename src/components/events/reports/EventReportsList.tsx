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
    // Enable real-time updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
  });

  const reportRows = reports?.map((report) => (
    <ReportListItem 
      key={report.id} 
      report={report}
    />
  ));

  return (
    <ReportListContainer 
      isLoading={isLoading} 
      error={error}
    >
      {{
        header: <ReportListHeader title="تقارير الفعالية" />,
        rows: reportRows
      }}
    </ReportListContainer>
  );
};