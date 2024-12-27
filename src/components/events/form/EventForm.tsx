import { EventFormFields } from "@/components/events/EventFormFields";
import { EventFormActions } from "@/components/events/form/EventFormActions";
import { useEventForm } from "./useEventForm";
import { useNavigate } from "react-router-dom";

interface EventFormProps {
  id?: string;
}

export const EventForm = ({ id }: EventFormProps) => {
  const navigate = useNavigate();
  const { formData, setFormData, isUploading, handleImageChange, handleSubmit } = useEventForm(id);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      navigate("/");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <EventFormFields 
        formData={formData} 
        setFormData={setFormData}
        onImageChange={handleImageChange}
      />
      <EventFormActions 
        isUploading={isUploading}
        onCancel={() => navigate("/")}
      />
    </form>
  );
};