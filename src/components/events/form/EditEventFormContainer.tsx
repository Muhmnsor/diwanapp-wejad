import { Event } from "@/store/eventStore";
import { EventFormFields } from "../EventFormFields";
import { handleImageUpload } from "./EventImageUpload";
import { toast } from "sonner";
import { useEventForm } from "./hooks/useEventForm";
import { handleEventUpdate } from "./handlers/EventUpdateHandler";

interface EditEventFormContainerProps {
  eventId?: string;
  onSave: (updatedEvent: Event) => void;
  onCancel: () => void;
}

export const EditEventFormContainer = ({ 
  eventId,
  onSave,
  onCancel 
}: EditEventFormContainerProps) => {
  const {
    formData,
    setFormData,
    isLoading,
    setIsLoading
  } = useEventForm(eventId);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const { publicUrl, error } = await handleImageUpload(file);
      if (error) throw error;
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await handleEventUpdate(formData, eventId);
      await onSave(formData);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("حدث خطأ أثناء تحديث الفعالية");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        onImageChange={handleImageChange}
      />
      <div className="flex justify-start gap-2 mt-6 text-right" dir="rtl">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "جاري التحديث..." : "تحديث الفعالية"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};