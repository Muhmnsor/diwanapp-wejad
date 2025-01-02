import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EventReport } from "@/types/eventReport";
import { EditReportDialogHeader } from "./dialog/EditReportDialogHeader";
import { EditReportDialogContent } from "./dialog/EditReportDialogContent";
import { EditReportDialogActions } from "./dialog/EditReportDialogActions";
import { ProjectActivity } from "@/types/activity";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: EventReport;
  activities?: ProjectActivity[];
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
  activities = [],
}: EditReportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState({
    report_name: report.report_name,
    program_name: report.program_name,
    report_text: report.report_text,
    detailed_description: report.detailed_description,
    activity_duration: report.activity_duration,
    attendees_count: report.attendees_count,
    activity_objectives: report.activity_objectives,
    impact_on_participants: report.impact_on_participants,
    photos: report.photos || [],
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting updated report:', formValues);

      const { error } = await supabase
        .from('event_reports')
        .update({
          report_name: formValues.report_name,
          program_name: formValues.program_name,
          report_text: formValues.report_text,
          detailed_description: formValues.detailed_description,
          activity_duration: formValues.activity_duration,
          attendees_count: formValues.attendees_count,
          activity_objectives: formValues.activity_objectives,
          impact_on_participants: formValues.impact_on_participants,
          photos: formValues.photos,
        })
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
      <DialogContent className="max-w-3xl">
        <EditReportDialogHeader />
        <EditReportDialogContent
          formValues={formValues}
          setFormValues={setFormValues}
          activities={activities}
        />
        <EditReportDialogActions
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};