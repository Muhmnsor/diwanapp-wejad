import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { EditReportDialogHeader } from "./dialog/EditReportDialogHeader";
import { ActivityReportFormFields } from "../form/ActivityReportFormFields";
import { Card } from "@/components/ui/card";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ProjectActivityReport;
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
}: EditReportDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting updated report:', values);

      const { error } = await supabase
        .from('project_activity_reports')
        .update({
          program_name: values.program_name,
          report_name: values.report_name,
          report_text: values.report_text,
          detailed_description: values.detailed_description,
          activity_duration: values.activity_duration,
          attendees_count: values.attendees_count,
          activity_objectives: values.activity_objectives,
          impact_on_participants: values.impact_on_participants,
          photos: values.photos,
        })
        .eq('id', report.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ['project-activity-reports', report.project_id]
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <EditReportDialogHeader />
        <Card className="p-6">
          <ActivityReportFormFields
            initialData={report}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </Card>
      </DialogContent>
    </Dialog>
  );
};