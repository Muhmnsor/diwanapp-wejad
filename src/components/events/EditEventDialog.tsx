import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/store/eventStore";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: Event) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange, onSave }: EditEventDialogProps) => {
  const [formData, setFormData] = useState<Event>(event);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave(formData);
      onOpenChange(false);
      toast.success("تم تحديث الفعالية بنجاح");
    } catch (error) {
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
          <div>
            <label className="text-sm font-medium">عنوان الفعالية</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">وصف الفعالية</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">التاريخ</label>
            <Input
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">الوقت</label>
            <Input
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">الموقع</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">نوع الفعالية</label>
            <Select
              value={formData.eventType}
              onValueChange={(value: "online" | "in-person") => 
                setFormData({ ...formData, eventType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">حضوري</SelectItem>
                <SelectItem value="online">عن بعد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">عدد المقاعد</label>
            <Input
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
            />
          </div>
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