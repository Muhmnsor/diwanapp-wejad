import { Event } from "@/store/eventStore";
import { EventBasicFields } from "@/components/events/form/EventBasicFields";
import { EditEventFormActions } from "@/components/events/form/EditEventFormActions";

interface EditProjectEventFormProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const EditProjectEventForm = ({ 
  formData, 
  setFormData, 
  onImageChange,
  onSave,
  onCancel,
  isLoading
}: EditProjectEventFormProps) => {
  console.log('Form data in EditProjectEventForm:', formData);
  
  return (
    <div className="space-y-6">
      <EventBasicFields
        formData={formData}
        setFormData={setFormData}
      />
      <EditEventFormActions
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};