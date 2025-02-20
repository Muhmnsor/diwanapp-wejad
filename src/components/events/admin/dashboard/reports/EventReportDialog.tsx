
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EventReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export const EventReportDialog = ({ open, onOpenChange, eventId }: EventReportDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    report_name: "",
    report_text: "",
    objectives: "",
    attendees_count: "",
    impact_on_participants: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_reports')
        .insert([
          {
            ...formData,
            event_id: eventId,
          }
        ]);

      if (error) throw error;

      toast.success("تم إضافة التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ['event-reports', eventId] });
      onOpenChange(false);
      setFormData({
        report_name: "",
        report_text: "",
        objectives: "",
        attendees_count: "",
        impact_on_participants: "",
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة تقرير جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">عنوان التقرير</label>
            <Input
              value={formData.report_name}
              onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
              required
              placeholder="أدخل عنوان التقرير"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">نص التقرير</label>
            <Textarea
              value={formData.report_text}
              onChange={(e) => setFormData({ ...formData, report_text: e.target.value })}
              required
              placeholder="أدخل تفاصيل التقرير"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">الأهداف المحققة</label>
            <Textarea
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="أدخل الأهداف التي تم تحقيقها"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">عدد الحضور</label>
            <Input
              type="number"
              value={formData.attendees_count}
              onChange={(e) => setFormData({ ...formData, attendees_count: e.target.value })}
              placeholder="أدخل عدد الحضور"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">التأثير على المستفيدين</label>
            <Textarea
              value={formData.impact_on_participants}
              onChange={(e) => setFormData({ ...formData, impact_on_participants: e.target.value })}
              placeholder="أدخل تأثير الفعالية على المستفيدين"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
