import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface EditReportDialogActionsProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const EditReportDialogActions = ({
  onSubmit,
  isSubmitting
}: EditReportDialogActionsProps) => {
  return (
    <DialogFooter className="px-6 py-4">
      <Button
        variant="default"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
      </Button>
    </DialogFooter>
  );
};