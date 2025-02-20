
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EventReportsListProps {
  eventId: string;
}

export const EventReportsList = ({ eventId }: EventReportsListProps) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['event-reports', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_reports')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (!reports?.length) {
    return (
      <Card className="p-6 text-center text-gray-500">
        لا يوجد تقارير بعد
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{report.report_name}</h3>
              <p className="text-gray-500 mt-1">{report.report_text}</p>
            </div>
            <span className="text-sm text-gray-500">
              {format(new Date(report.created_at), 'dd MMMM yyyy', { locale: ar })}
            </span>
          </div>
          
          {report.objectives && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">الأهداف:</h4>
              <p className="text-gray-600">{report.objectives}</p>
            </div>
          )}

          {report.attendees_count && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">عدد الحضور:</h4>
              <p className="text-gray-600">{report.attendees_count}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
