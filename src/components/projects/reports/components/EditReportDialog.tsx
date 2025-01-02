import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { EditReportDialogHeader } from "./dialog/EditReportDialogHeader";
import { EditReportDialogContent } from "./dialog/EditReportDialogContent";
import { EditReportDialogActions } from "./dialog/EditReportDialogActions";

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

  // Parse photos from string to object if needed
  const parsePhotos = (photos: any[]) => {
    return photos?.map(photo => {
      if (typeof photo === 'string') {
        try {
          return JSON.parse(photo);
        } catch (e) {
          console.error('Error parsing photo:', e);
          return { url: photo, description: '' };
        }
      }
      return photo;
    }).filter(photo => photo !== null) || [];
  };

  const [formValues, setFormValues] = useState({
    report_name: report.report_name,
    program_name: report.program_name,
    report_text: report.report_text,
    detailed_description: report.detailed_description,
    activity_duration: report.activity_duration || '',
    attendees_count: report.attendees_count || '',
    activity_objectives: report.activity_objectives || '',
    impact_on_participants: report.impact_on_participants || '',
    photos: parsePhotos(report.photos || []),
  });

  console.log('EditReportDialog - Current photos:', formValues.photos);

  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', report.activity_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', report.activity_id)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting updated report:', formValues);

      // Prepare photos data for submission
      const preparedPhotos = formValues.photos.map(photo => {
        if (typeof photo === 'string') {
          return photo;
        }
        return JSON.stringify(photo);
      });

      const { error } = await supabase
        .from('project_activity_reports')
        .update({
          report_name: formValues.report_name,
          program_name: formValues.program_name,
          report_text: formValues.report_text,
          detailed_description: formValues.detailed_description,
          activity_duration: formValues.activity_duration,
          attendees_count: formValues.attendees_count,
          activity_objectives: formValues.activity_objectives,
          impact_on_participants: formValues.impact_on_participants,
          photos: preparedPhotos,
        })
        .eq('id', report.id)
        .select();

      if (error) {
        console.error('Error updating report:', error);
        throw error;
      }

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