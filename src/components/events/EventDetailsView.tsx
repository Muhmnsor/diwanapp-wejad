import { Event } from "@/store/eventStore";
import { EventReportDialog } from "./EventReportDialog";
import { EventAdminTabs } from "./admin/EventAdminTabs";
import { useUserRoles } from "./admin/useUserRoles";
import { useState } from "react";
import { EventImage } from "./EventImage";
import { EventTitle } from "./EventTitle";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { EventContent } from "./EventContent";

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
  isAdmin,
}: EventDetailsViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  
  console.log('EventDetailsView - Event data:', event);
  console.log('EventDetailsView - isAdmin:', isAdmin);
  console.log('EventDetailsView - User roles:', userRoles);

  const handleRegister = () => {
    console.log('Opening registration dialog');
    setIsRegistrationOpen(true);
  };

  const canAddReport = !rolesLoading && (
    userRoles.includes('admin') || 
    userRoles.includes('event_executor')
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Always show event details */}
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
          onRegister={handleRegister}
        />

        {/* Show admin controls if user has permissions */}
        {(isAdmin || canAddReport) && (
          <>
            <div className="mt-8 border-t border-gray-100">
              <EventAdminTabs
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddToCalendar={onAddToCalendar}
                onRegister={handleRegister}
                id={id}
                canAddReport={canAddReport}
                onAddReport={() => setIsReportDialogOpen(true)}
                isAdmin={isAdmin}
              />
            </div>

            <EventReportDialog
              open={isReportDialogOpen}
              onOpenChange={setIsReportDialogOpen}
              eventId={id}
            />
          </>
        )}

        <EventRegistrationDialog
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          event={event}
        />
      </div>
    </div>
  );
};