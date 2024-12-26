import { Card, CardContent } from "@/components/ui/card";
import { EventReportForm } from "../../events/EventReportForm";
import { EventReportsList } from "../../events/reports/EventReportsList";
import { toast } from "sonner";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <EventReportForm 
          eventId={eventId}
          onSuccess={() => {
            toast.success("تم إضافة التقرير بنجاح");
          }}
        />
        <EventReportsList eventId={eventId} />
      </CardContent>
    </Card>
  );
};