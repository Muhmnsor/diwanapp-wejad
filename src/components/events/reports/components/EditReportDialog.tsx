import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Report } from "@/types/report";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    detailed_description: report.detailed_description || '',
    event_duration: report.event_duration || '',
    attendees_count: report.attendees_count || '',
    event_objectives: report.event_objectives || '',
    impact_on_participants: report.impact_on_participants || '',
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل التقرير</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم البرنامج/المشروع</label>
              <Input
                value={formData.program_name}
                onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
                placeholder="أدخل اسم البرنامج/المشروع"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الفعالية</label>
              <Input
                value={formData.report_name}
                onChange={(e) => setFormData(prev => ({ ...prev, report_name: e.target.value }))}
                placeholder="أدخل اسم الفعالية"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نص التقرير</label>
              <Textarea
                value={formData.report_text}
                onChange={(e) => setFormData(prev => ({ ...prev, report_text: e.target.value }))}
                placeholder="اكتب نص التقرير"
                className="text-right min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف التفصيلي</label>
              <Textarea
                value={formData.detailed_description}
                onChange={(e) => setFormData(prev => ({ ...prev, detailed_description: e.target.value }))}
                placeholder="اكتب الوصف التفصيلي للفعالية"
                className="text-right min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة الفعالية</label>
                <Input
                  value={formData.event_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_duration: e.target.value }))}
                  placeholder="مثال: ساعتين، 3 ساعات"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">عدد المشاركين</label>
                <Input
                  value={formData.attendees_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees_count: e.target.value }))}
                  placeholder="أدخل عدد المشاركين"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">أهداف الفعالية</label>
              <Textarea
                value={formData.event_objectives}
                onChange={(e) => setFormData(prev => ({ ...prev, event_objectives: e.target.value }))}
                placeholder="اكتب أهداف الفعالية"
                className="text-right min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الأثر على المشاركين</label>
              <Textarea
                value={formData.impact_on_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, impact_on_participants: e.target.value }))}
                placeholder="اكتب الأثر على المشاركين"
                className="text-right min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};