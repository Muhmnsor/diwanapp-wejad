import { Event } from "@/store/eventStore";
import { EventReportDialog } from "./EventReportDialog";
import { EventAdminTabs } from "./admin/EventAdminTabs";
import { useUserRoles } from "./admin/useUserRoles";
import { useState } from "react";
import { EventContent } from "./EventContent";
import { EventHeader } from "./EventHeader";
import { EventTitle } from "./EventTitle";
import { EventImage } from "./EventImage";

interface EventDetailsViewProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
  isAdmin: boolean;
}

export const EventDetailsView = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id,
  isAdmin
}: EventDetailsViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();

  const canAddReport = !rolesLoading && (
    userRoles.includes('admin') || 
    userRoles.includes('event_executor')
  );
  
  console.log('Event data in EventDetailsView:', event);
  console.log('Can add report:', canAddReport);
  console.log('User roles:', userRoles);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <EventImage imageUrl={event.image_url || event.imageUrl || ''} title={event.title} />
      
      <EventTitle 
        title={event.title}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
        onShare={async () => {}}
        onAddToCalendar={onAddToCalendar}
      />

      <EventContent 
        event={event}
        onRegister={onRegister}
      />

      {canAddReport && (
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
            isAdmin={isAdmin}
          />

          <EventReportDialog
            open={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            eventId={id}
          />
        </>
      )}
    </div>
  );
};