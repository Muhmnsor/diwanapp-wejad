import { Event as CustomEvent } from "@/store/eventStore";
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
import { EventHeader } from "./EventHeader";
import { EventImage } from "./EventImage";
import { EventTitle } from "./EventTitle";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { EventContainer } from "./EventContainer";
import { EventContent } from "./EventContent";
import { EventFooter } from "./EventFooter";

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
  onRegister,
}: EventDetailsViewProps) => {
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

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
    setIsRegistrationOpen(true);
  };

  const imageUrl = event.imageUrl || event.image_url;

  return (
    <EventContainer>
      <EventHeader 
        title="ديوان"
        showLogo={false}
      />

      <EventImage imageUrl={imageUrl} title={event.title} />

      <div className="bg-white shadow-sm">
        <EventTitle
          title={event.title}
          isAdmin={user?.isAdmin}
          onEdit={onEdit}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onShare={async () => {}}
          onAddToCalendar={onAddToCalendar}
        />

        <EventContent 
          event={event}
          onRegister={handleRegister}
        />
      </div>

      <EventFooter />

      <EventRegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
        event={event}
      />

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
    </EventContainer>
  );
};