import { Event } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { EditEventFormActions } from "./form/EditEventFormActions";

interface EditEventFormProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const EditEventForm = ({ 
  formData, 
  setFormData, 
  onImageChange,
  onSave,
  onCancel,
  isLoading
}: EditEventFormProps) => {
  console.log('Form data in EditEventForm:', formData);
  
  return (
    <div className="space-y-6">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        onImageChange={onImageChange}
      />
      <EditEventFormActions
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};