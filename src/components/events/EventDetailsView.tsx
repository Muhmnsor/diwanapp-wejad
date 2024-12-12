import { Event as CustomEvent } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventActions } from "./EventActions";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { getEventStatus } from "@/utils/eventUtils";

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

  // Handle both imageUrl and image_url properties
  const imageUrl = event.imageUrl || event.image_url;

  const eventStatus = getEventStatus(event);
  const statusColors = {
    available: "bg-green-500 hover:bg-green-600",
    full: "bg-yellow-500",
    ended: "bg-red-500",
    notStarted: "bg-blue-500"
  };

  const statusText = {
    available: "تسجيل الحضور",
    full: "اكتمل التسجيل",
    ended: "انتهى التسجيل",
    notStarted: "لم يبدأ التسجيل"
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ديوان</h1>
        <img
          src="/lovable-uploads/8f06dc5f-92e3-4f27-8dbb-9769d6e9d178.png"
          alt="Logo"
          className="w-16 h-16"
        />
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-[400px] object-cover rounded-lg mb-8"
        />
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex gap-2">
            {user?.isAdmin && (
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <EventActions
              eventTitle={event.title}
              eventDescription={event.description}
              onShare={async () => {}}
              onAddToCalendar={onAddToCalendar}
            />
          </div>
        </div>

        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          attendees={event.attendees}
          maxAttendees={event.maxAttendees}
          eventType={event.eventType}
          price={event.price}
        />

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">عن الفعالية</h2>
          <p className="text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{event.description}</p>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className={`w-full text-white ${statusColors[eventStatus]}`}
            onClick={onRegister}
            disabled={eventStatus !== 'available'}
          >
            {statusText[eventStatus]}
          </Button>
        </div>
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