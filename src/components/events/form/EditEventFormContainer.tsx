import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EditEventForm } from "../EditEventForm";

interface EditEventFormContainerProps {
  event: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
  isProjectEvent?: boolean;
}

export const EditEventFormContainer = ({ 
  event, 
  onSave, 
  onCancel,
  isProjectEvent = false 
}: EditEventFormContainerProps) => {
  const [formData, setFormData] = useState<Event>(event);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  console.log('Form data in EditEventFormContainer:', formData);
  console.log('Is project event:', isProjectEvent);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditEventForm
      formData={formData}
      setFormData={setFormData}
      onImageChange={setImageFile}
      onSave={handleSave}
      onCancel={onCancel}
      isLoading={isLoading}
      isProjectEvent={isProjectEvent}
    />
  );
};