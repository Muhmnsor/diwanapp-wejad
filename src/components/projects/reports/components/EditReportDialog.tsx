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
import { ProjectActivityReportForm } from "../ProjectActivityReportForm";

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

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-activity-reports', report.activity_id]
    });
    onOpenChange(false);
    toast.success("تم تحديث التقرير بنجاح");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <EditReportDialogHeader />
        <ProjectActivityReportForm
          projectId={report.project_id || ''}
          activityId={report.activity_id || ''}
          initialData={report}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};