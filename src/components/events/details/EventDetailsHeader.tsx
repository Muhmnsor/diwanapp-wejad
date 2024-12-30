import { Event } from "@/types/event";
import { EventTitle } from "../EventTitle";
import { EventImage } from "../EventImage";

interface EventDetailsHeaderProps {
  event: Event;
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
  return (
    <div className="bg-white rounded-t-2xl overflow-hidden">
      <EventImage imageUrl={event.image_url} title={event.title} />
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