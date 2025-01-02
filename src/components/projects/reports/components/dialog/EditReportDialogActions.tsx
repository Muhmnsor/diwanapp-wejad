import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface EditReportDialogActionsProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const EditReportDialogActions = ({
  onSubmit,
  isSubmitting,
}: EditReportDialogActionsProps) => {
  return (
    <DialogFooter className="gap-2">
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'جاري التحديث...' : 'تحديث التقرير'}
      </Button>
    </DialogFooter>
  );
};