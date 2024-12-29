import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EditProjectEventForm } from "./EditProjectEventForm";

interface EditProjectEventFormContainerProps {
  event: Event;
  onSave: (updatedEvent: Event) => void;
  onCancel: () => void;
  projectId: string;
}

export const EditProjectEventFormContainer = ({
  event,
  onSave,
  onCancel,
  projectId
}: EditProjectEventFormContainerProps) => {
  const [formData, setFormData] = useState<Event>(event);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditProjectEventForm
      formData={formData}
      setFormData={setFormData}
      onImageChange={handleImageChange}
      onSave={handleSave}
      onCancel={onCancel}
      isLoading={isLoading}
      projectId={projectId}
    />
  );
};