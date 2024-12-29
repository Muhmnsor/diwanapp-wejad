import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EditProjectEventForm } from "./EditProjectEventForm";

interface EditProjectEventFormContainerProps {
  event: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
}

export const EditProjectEventFormContainer = ({ 
  event, 
  onSave, 
  onCancel,
}: EditProjectEventFormContainerProps) => {
  const [formData, setFormData] = useState<Event>(event);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  console.log('Form data in EditProjectEventFormContainer:', formData);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving project event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditProjectEventForm
      formData={formData}
      setFormData={setFormData}
      onImageChange={setImageFile}
      onSave={handleSave}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};