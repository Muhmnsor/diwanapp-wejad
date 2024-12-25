import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventReportDialog } from "./EventReportDialog";
import { EventAdminTabs } from "./admin/EventAdminTabs";
import { useUserRoles } from "./admin/useUserRoles";

interface EventAdminViewProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
}

export const EventAdminView = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id
}: EventAdminViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();

  const canAddReport = !rolesLoading && (
    userRoles.includes('admin') || 
    userRoles.includes('event_executor')
  );
  
  console.log('Can add report:', canAddReport, 'Roles loading:', rolesLoading);

  return (
    <>
      <EventAdminTabs
        event={event}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddToCalendar={onAddToCalendar}
        onRegister={onRegister}
        id={id}
        canAddReport={canAddReport}
        onAddReport={() => setIsReportDialogOpen(true)}
      />

      <EventReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        eventId={id}
      />
    </>
  );
};