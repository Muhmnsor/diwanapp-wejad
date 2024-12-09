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

interface EditEventDialogProps {
  event: CustomEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: CustomEvent) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange, onSave }: EditEventDialogProps) => {
  const [formData, setFormData] = useState<CustomEvent>(event);

  useEffect(() => {
    setFormData(event);
  }, [event]);

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
          <EventFormFields formData={formData} setFormData={setFormData} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ التغييرات</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};