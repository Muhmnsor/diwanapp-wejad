import { EventType } from "@/types/event";
import { EventTitle } from "../EventTitle";
import { EventImage } from "../EventImage";

interface EventDetailsHeaderProps {
  event: EventType;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
}

export const EventDetailsHeader = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar
}: EventDetailsHeaderProps) => {
  console.log('EventDetailsHeader received props:', {
    event,
    isAdmin
  });

  const imageUrl = event.image_url || event.imageUrl;

  return (
    <div className="bg-white rounded-t-2xl overflow-hidden">
      <EventImage imageUrl={imageUrl} title={event.title} />
      <EventTitle
        title={event.title}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddToCalendar={onAddToCalendar}
      />
    </div>
  );
};