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
  canAddReport?: boolean;
  onAddReport?: () => void;
}

export const EventDetailsView = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id,
  isAdmin,
  canAddReport,
  onAddReport
}: EventDetailsViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  
  console.log('Event data in EventDetailsView:', event);
  console.log('Can add report:', canAddReport);
  console.log('User roles:', userRoles);

  return (
    <div className="bg-white rounded-lg shadow-sm">
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

      {(isAdmin || canAddReport) && (
        <>
          <EventAdminTabs
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToCalendar={onAddToCalendar}
            onRegister={onRegister}
            id={id}
            canAddReport={canAddReport || false}
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