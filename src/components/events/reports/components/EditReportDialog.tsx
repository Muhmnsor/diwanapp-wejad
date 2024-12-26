import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Report } from "@/types/report";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
}: EditReportDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    program_name: report.program_name || '',
    report_name: report.report_name,
    report_text: report.report_text,
    detailed_description: report.detailed_description,
    event_duration: report.event_duration,
    attendees_count: report.attendees_count,
    event_objectives: report.event_objectives,
    impact_on_participants: report.impact_on_participants,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_reports')
        .update(formData)
        .eq('id', report.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ['event-reports', report.event_id]
      });
      
      toast.success('تم تحديث التقرير بنجاح');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('حدث خطأ أثناء تحديث التقرير');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل التقرير</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              placeholder="اسم البرنامج"
              value={formData.program_name}
              onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
            />
            <Input
              placeholder="اسم التقرير"
              value={formData.report_name}
              onChange={(e) => setFormData(prev => ({ ...prev, report_name: e.target.value }))}
              required
            />
            <Input
              placeholder="نص التقرير"
              value={formData.report_text}
              onChange={(e) => setFormData(prev => ({ ...prev, report_text: e.target.value }))}
              required
            />
            <Input
              placeholder="الوصف التفصيلي"
              value={formData.detailed_description}
              onChange={(e) => setFormData(prev => ({ ...prev, detailed_description: e.target.value }))}
            />
            <Input
              placeholder="مدة الفعالية"
              value={formData.event_duration}
              onChange={(e) => setFormData(prev => ({ ...prev, event_duration: e.target.value }))}
            />
            <Input
              placeholder="عدد الحضور"
              value={formData.attendees_count}
              onChange={(e) => setFormData(prev => ({ ...prev, attendees_count: e.target.value }))}
            />
            <Input
              placeholder="أهداف الفعالية"
              value={formData.event_objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, event_objectives: e.target.value }))}
            />
            <Input
              placeholder="أثر الفعالية على المشاركين"
              value={formData.impact_on_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, impact_on_participants: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
