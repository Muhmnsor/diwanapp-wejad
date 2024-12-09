import { Button } from "@/components/ui/button";
import { Event as CustomEvent } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface EditEventFormProps {
  event: CustomEvent;
  onSave: (updatedEvent: CustomEvent) => void;
  onCancel: () => void;
}

export const EditEventForm = ({ event, onSave, onCancel }: EditEventFormProps) => {
  const [formData, setFormData] = useState<CustomEvent>(event);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        imageUrl: publicUrl,
        image_url: publicUrl
      }));

      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    try {
      const updateData = {
        ...formData,
        image_url: formData.imageUrl || formData.image_url
      };
      
      onSave(updateData);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("حدث خطأ أثناء تحديث الفعالية");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EventFormFields 
        formData={formData} 
        setFormData={setFormData}
        onImageChange={handleImageUpload}
      />
      <div className="flex justify-start gap-2 sticky bottom-0 bg-background py-4">
        <Button 
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "جاري الرفع..." : "حفظ التغييرات"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};