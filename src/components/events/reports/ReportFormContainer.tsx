import { EventReportForm } from "../EventReportForm";
import { EventReportsList } from "./EventReportsList";

interface ReportFormContainerProps {
  eventId: string;
  onSuccess?: () => void;
}

export const ReportFormContainer = ({ eventId, onSuccess }: ReportFormContainerProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <EventReportForm eventId={eventId} onSuccess={onSuccess} />
      <EventReportsList eventId={eventId} />
    </div>
  );
};