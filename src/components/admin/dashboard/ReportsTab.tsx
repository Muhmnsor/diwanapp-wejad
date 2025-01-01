import { Card, CardContent } from "@/components/ui/card";
import { EventReportForm } from "../../events/EventReportForm";
import { EventReportsList } from "../../events/reports/EventReportsList";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const queryClient = useQueryClient();

  const handleSuccess = async () => {
    console.log('Report submitted successfully, refreshing reports list');
    await queryClient.invalidateQueries({ queryKey: ['event-reports', eventId] });
    toast.success("تم إضافة التقرير بنجاح");
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <EventReportForm 
          eventId={eventId}
          onSuccess={handleSuccess}
        />
        <EventReportsList eventId={eventId} />
      </CardContent>
    </Card>
  );
};