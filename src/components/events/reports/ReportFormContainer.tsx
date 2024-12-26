import { EventReportForm } from "../EventReportForm";
import { EventReportsList } from "./EventReportsList";
import { useQueryClient } from "@tanstack/react-query";

interface ReportFormContainerProps {
  eventId: string;
  onSuccess?: () => void;
}

export const ReportFormContainer = ({ eventId, onSuccess }: ReportFormContainerProps) => {
  const queryClient = useQueryClient();

  const handleSuccess = async () => {
    console.log('Report submitted successfully, invalidating queries');
    await queryClient.invalidateQueries({ queryKey: ['event-reports', eventId] });
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <EventReportForm eventId={eventId} onSuccess={handleSuccess} />
      <EventReportsList eventId={eventId} />
    </div>
  );
};