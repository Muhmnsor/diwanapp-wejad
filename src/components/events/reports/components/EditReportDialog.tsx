import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportFormFields } from "../form/ReportFormFields";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    id: string;
    event_id: string;
    program_name: string;
    report_name: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: { url: string; description: string; }[];
  };
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
}: EditReportDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState({
    program_name: report.program_name || '',
    report_name: report.report_name || '',
    report_text: report.report_text || '',
    detailed_description: report.detailed_description || '',
    event_duration: report.event_duration || '',
    attendees_count: report.attendees_count || '',
    event_objectives: report.event_objectives || '',
    impact_on_participants: report.impact_on_participants || '',
    photos: report.photos || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_reports')
        .update({
          program_name: formValues.program_name,
          report_name: formValues.report_name,
          report_text: formValues.report_text,
          detailed_description: formValues.detailed_description,
          event_duration: formValues.event_duration,
          attendees_count: formValues.attendees_count,
          event_objectives: formValues.event_objectives,
          impact_on_participants: formValues.impact_on_participants,
          photos: formValues.photos
        })
        .eq('id', report.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['event-reports', report.event_id] });
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل التقرير</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <ReportFormFields
            formValues={formValues}
            setValue={(field, value) => 
              setFormValues(prev => ({ ...prev, [field]: value }))
            }
          />
          <div className="flex justify-start gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};