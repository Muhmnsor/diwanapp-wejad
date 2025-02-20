
import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

export const ReportFormActions = ({ isSubmitting, onClose }: ReportFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onClose}>
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
      </Button>
    </div>
  );
};
