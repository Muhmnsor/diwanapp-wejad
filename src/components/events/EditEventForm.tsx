import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { EditEventFormActions } from "./form/EditEventFormActions";
import { toast } from "sonner";

interface EditEventFormProps {
  event: Event;
  onSave: (event: Event) => void;
  onCancel: () => void;
}

export const EditEventForm = ({ event, onSave, onCancel }: EditEventFormProps) => {
  const [formData, setFormData] = useState<Event>(event);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  console.log('Form data in EditEventForm:', formData);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.date || !formData.time || !formData.location) {
        toast.error("يرجى تعبئة جميع الحقول المطلوبة");
        return;
      }

      // Create the event object to save
      const eventToSave: Event = {
        ...formData,
        imageUrl: formData.imageUrl || event.imageUrl,
      };

      await onSave(eventToSave);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        onImageChange={setImageFile}
      />
      <EditEventFormActions
        onSave={handleSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};