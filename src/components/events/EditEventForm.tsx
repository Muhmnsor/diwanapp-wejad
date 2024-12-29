import { Event } from "@/store/eventStore";
import { EventBasicFields } from "@/components/events/form/EventBasicFields";
import { EditEventFormActions } from "@/components/events/form/EditEventFormActions";

interface EditEventFormProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isProjectEvent?: boolean;
}

export const EditEventForm = ({ 
  formData, 
  setFormData, 
  onImageChange,
  onSave,
  onCancel,
  isLoading,
  isProjectEvent = false
}: EditEventFormProps) => {
  console.log('Form data in EditEventForm:', formData);
  console.log('Is project event:', isProjectEvent);
  
  return (
    <div className="space-y-6">
      <EventBasicFields
        formData={formData}
        setFormData={setFormData}
        isProjectEvent={isProjectEvent}
      />
      <EditEventFormActions
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};