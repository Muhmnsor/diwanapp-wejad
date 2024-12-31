import { Event } from "@/store/eventStore";
import { EventImage } from "../EventImage";
import { EventTitle } from "../EventTitle";

interface EventDetailsHeaderProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onVisibilityChange: (visible: boolean) => void;
}

export const EventDetailsHeader = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  onVisibilityChange
}: EventDetailsHeaderProps) => {
  return (
    <>
      <EventImage 
        imageUrl={event.image_url || event.imageUrl} 
        title={event.title} 
      />
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <EventTitle
            title={event.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToCalendar={onAddToCalendar}
            isVisible={event.is_visible}
            onVisibilityChange={onVisibilityChange}
          />
        </div>
      </div>
    </>
  );
};