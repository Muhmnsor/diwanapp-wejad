
import { Event } from "@/types/event";
import { EventFormFields } from "@/components/events/EventFormFields";
import { EditEventFormActions } from "@/components/events/form/EditEventFormActions";

interface EditProjectEventFormProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  projectId: string;
}

export const EditProjectEventForm = ({ 
  formData, 
  setFormData, 
  onImageChange,
  onSave,
  onCancel,
  isLoading,
  projectId
}: EditProjectEventFormProps) => {
  console.log('Form data in EditProjectEventForm:', formData, 'Project ID:', projectId);
  
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
