import { EventType } from "@/types/event";
import { EventTitle } from "../EventTitle";
import { EventImage } from "../EventImage";

interface EventDetailsHeaderProps {
  event: EventType;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => Promise<void>;
  onAddToCalendar: () => void;
}

export const EventDetailsHeader = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onShare,
  onAddToCalendar
}: EventDetailsHeaderProps) => {
  const imageUrl = event.imageUrl || event.image_url;

  return (
    <div className="bg-white rounded-t-2xl overflow-hidden">
      <EventImage imageUrl={imageUrl} title={event.title} />
      <EventTitle
        title={event.title}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
        onShare={onShare}
        onAddToCalendar={onAddToCalendar}
      />
    </div>
  );
};