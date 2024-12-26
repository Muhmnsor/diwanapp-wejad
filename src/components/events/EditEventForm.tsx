import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { EditEventFormActions } from "./form/EditEventFormActions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditEventFormProps {
  event: Event;
  onSave: (event: Event) => Promise<void>;
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

      // If there's a new image file, upload it first
      let imageUrl = formData.imageUrl || formData.image_url;
      if (imageFile) {
        const fileName = `event-images/${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { error: uploadError, data } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error("حدث خطأ أثناء رفع الصورة");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Prepare the event data for saving
      const eventToSave: Event = {
        ...formData,
        image_url: imageUrl,
        imageUrl: imageUrl,
      };

      // Call the parent's onSave function
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