import { Event as CustomEvent } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventActions } from "./EventActions";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

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

  return (
    <div className="max-w-4xl mx-auto">
      <img
        src={event.imageUrl}
        alt={event.title}
        className="w-full h-[400px] object-cover rounded-lg mb-8"
      />

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
                  onClick={onDelete}
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
          <p className="text-gray-600 leading-relaxed">{event.description}</p>
        </div>

        <div className="flex justify-center">
          <Button size="lg" className="w-full md:w-auto" onClick={onRegister}>
            تسجيل الحضور
          </Button>
        </div>
      </div>
    </div>
  );
};