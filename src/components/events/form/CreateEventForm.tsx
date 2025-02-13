import { Event } from "@/store/eventStore";
import { EventFormFields } from "@/components/events/EventFormFields";
import { EventFormActions } from "@/components/events/form/EventFormActions";

interface CreateEventFormProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
  onCancel: () => void;
}

export const CreateEventForm = ({
  formData,
  setFormData,
  onImageChange,
  onSubmit,
  isUploading,
  onCancel
}: CreateEventFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <EventFormFields 
        formData={formData} 
        setFormData={setFormData}
        onImageChange={onImageChange}
      />
      <EventFormActions 
        isUploading={isUploading}
        onCancel={onCancel}
      />
    </form>
  );
};