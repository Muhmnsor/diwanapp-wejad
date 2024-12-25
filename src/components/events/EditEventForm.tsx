import { Event as CustomEvent } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { toast } from "sonner";
import { useState } from "react";
import { EventFormActions } from "./form/EventFormActions";
import { handleImageUpload } from "./form/EventImageUpload";

interface EditEventFormProps {
  event: CustomEvent;
  onSave: (updatedEvent: CustomEvent) => void;
  onCancel: () => void;
}

export const EditEventForm = ({ event, onSave, onCancel }: EditEventFormProps) => {
  console.log('Initial event data in EditEventForm:', {
    ...event,
    certificateType: event.certificateType || event.certificate_type,
    eventHours: event.eventHours || event.event_hours
  });
  
  const [formData, setFormData] = useState<CustomEvent>({
    ...event,
    certificateType: event.certificateType || event.certificate_type || 'none',
    eventHours: event.eventHours || event.event_hours || 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    try {
      const updateData = {
        ...formData,
        image_url: formData.imageUrl || formData.image_url,
        registration_start_date: formData.registrationStartDate,
        registration_end_date: formData.registrationEndDate,
        certificate_type: formData.certificateType,
        event_hours: formData.eventHours
      };
      
      console.log('Updating event with data:', updateData);
      onSave(updateData);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("حدث خطأ أثناء تحديث الفعالية");
    }
  };

  const handleImageChange = async (file: File) => {
    await handleImageUpload(file, setIsUploading, setFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EventFormFields 
        formData={formData} 
        setFormData={setFormData}
        onImageChange={handleImageChange}
      />
      <EventFormActions 
        isUploading={isUploading}
        onCancel={onCancel}
      />
    </form>
  );
};