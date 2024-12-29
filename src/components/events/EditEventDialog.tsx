import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Event as CustomEvent } from "@/store/eventStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditEventHeader } from "./EditEventHeader";
import { EditEventFormContainer } from "./form/EditEventFormContainer";

interface EditEventDialogProps {
  event: CustomEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: CustomEvent) => void;
}

export const EditEventDialog = ({ 
  event, 
  open, 
  onOpenChange, 
  onSave 
}: EditEventDialogProps) => {
  console.log('Event data in EditEventDialog:', event);

  // Transform event data to match form structure
  const formattedEvent = {
    ...event,
    eventType: event.event_type,
    beneficiaryType: event.beneficiary_type,
    certificateType: event.certificate_type,
    eventHours: event.event_hours,
    registrationStartDate: event.registration_start_date,
    registrationEndDate: event.registration_end_date,
    imageUrl: event.image_url,
    location_url: event.location_url,
    special_requirements: event.special_requirements,
    event_path: event.event_path,
    event_category: event.event_category
  };

  const handleSave = async (updatedEvent: CustomEvent) => {
    // Transform back to API format
    const apiFormattedEvent = {
      ...updatedEvent,
      event_type: updatedEvent.eventType || updatedEvent.event_type,
      beneficiary_type: updatedEvent.beneficiaryType || updatedEvent.beneficiary_type,
      certificate_type: updatedEvent.certificateType || updatedEvent.certificate_type,
      event_hours: updatedEvent.eventHours || updatedEvent.event_hours,
      registration_start_date: updatedEvent.registrationStartDate || updatedEvent.registration_start_date,
      registration_end_date: updatedEvent.registrationEndDate || updatedEvent.registration_end_date,
      image_url: updatedEvent.imageUrl || updatedEvent.image_url,
      location_url: updatedEvent.location_url,
      special_requirements: updatedEvent.special_requirements,
      event_path: updatedEvent.event_path,
      event_category: updatedEvent.event_category
    };

    await onSave(apiFormattedEvent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <EditEventFormContainer
            event={formattedEvent}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};