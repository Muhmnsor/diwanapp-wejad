import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event as CustomEvent } from "@/store/eventStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EventFormFields } from "./EventFormFields";
import { supabase } from "@/integrations/supabase/client";

interface EditEventDialogProps {
  event: CustomEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: CustomEvent) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange, onSave }: EditEventDialogProps) => {
  const [formData, setFormData] = useState<CustomEvent>(event);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log('Event data in EditEventDialog:', event);
    setFormData(event);
  }, [event]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    try {
      onSave(formData);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("حدث خطأ أثناء تحديث الفعالية");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الفعالية</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EventFormFields 
            formData={formData} 
            setFormData={setFormData}
            onImageChange={handleImageUpload}
          />
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={isUploading}
            >
              {isUploading ? "جاري الرفع..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};