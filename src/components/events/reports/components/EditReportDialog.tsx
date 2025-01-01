import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Report } from "@/types/report";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditReportFormFields } from "../form/EditReportFormFields";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  isProjectActivity?: boolean;
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
  isProjectActivity = false,
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
    photos: report.photos ? report.photos.map(photo => {
      if (typeof photo === 'string') {
        try {
          return JSON.parse(photo);
        } catch {
          return { url: photo, description: '' };
        }
      }
      return photo;
    }) : [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Updating report with data:', formData);
      console.log('Is project activity:', isProjectActivity);
      
      const tableName = isProjectActivity ? 'project_activity_reports' : 'event_reports';
      console.log('Using table:', tableName);

      const { error } = await supabase
        .from(tableName)
        .update({
          program_name: formData.program_name,
          report_name: formData.report_name,
          report_text: formData.report_text,
          detailed_description: formData.detailed_description,
          activity_duration: formData.event_duration,
          attendees_count: formData.attendees_count,
          activity_objectives: formData.event_objectives,
          impact_on_participants: formData.impact_on_participants,
          photos: formData.photos
        })
        .eq('id', report.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: isProjectActivity 
          ? ['project-activity-reports', report.event_id]
          : ['event-reports', report.event_id]
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

  const setValue = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل التقرير</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            <EditReportFormFields 
              formValues={formData}
              setValue={setValue}
            />

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