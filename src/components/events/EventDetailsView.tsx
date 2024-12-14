import { Event as CustomEvent } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { useAuthStore } from "@/store/authStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";
import { EventHeader } from "./EventHeader";
import { EventImage } from "./EventImage";
import { EventTitle } from "./EventTitle";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";

interface EventDetailsViewProps {
  event: CustomEvent;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
}

export const EventDetailsView = ({ 
  event, 
  onEdit, 
  onDelete, 
  onAddToCalendar,
  onRegister 
}: EventDetailsViewProps) => {
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  console.log('Event data in EventDetailsView:', event);

  if (!event) {
    console.error('No event data provided to EventDetailsView');
    return <div className="text-center p-8">لا توجد بيانات للفعالية</div>;
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete();
  };

  const handleRegister = () => {
    const status = getEventStatus(event);
    console.log('Current event status:', status);
    if (status === 'available') {
      onRegister();
    }
  };

  // Handle both imageUrl and image_url properties
  const imageUrl = event.imageUrl || event.image_url;
  const eventStatus = getEventStatus(event);

  console.log('Event status before rendering button:', eventStatus);

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <EventHeader 
        title="ديوان"
        logoUrl="/lovable-uploads/8f06dc5f-92e3-4f27-8dbb-9769d6e9d178.png"
      />

      <EventImage imageUrl={imageUrl} title={event.title} />

      <div className="bg-white rounded-lg shadow-lg p-8">
        <EventTitle
          title={event.title}
          isAdmin={user?.isAdmin}
          onEdit={onEdit}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onShare={async () => {}}
          onAddToCalendar={onAddToCalendar}
        />

        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          attendees={event.attendees}
          maxAttendees={event.maxAttendees}
          eventType={event.eventType}
          price={event.price}
        />

        <EventDescription description={event.description} />

        <EventRegisterButton 
          status={eventStatus}
          onRegister={handleRegister}
        />
      </div>

      <div className="mt-8 text-center">
        <a 
          href="https://www.dfy.org.sa" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          www.dfy.org.sa
        </a>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الفعالية؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الفعالية بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};