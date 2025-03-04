
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ClipboardList } from "lucide-react";

interface EditTaskProjectActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

export const EditTaskProjectActions = ({
  isSubmitting,
  onClose,
}: EditTaskProjectActionsProps) => {
  return (
    <DialogFooter className="flex justify-start gap-2 mt-6">
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        {isSubmitting ? "جاري التحديث..." : "تحديث المشروع"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        إلغاء
      </Button>
    </DialogFooter>
  );
};
