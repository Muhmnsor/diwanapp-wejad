import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
}

export const ReportFormActions = ({ isSubmitting, onCancel }: ReportFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
      </Button>
    </div>
  );
};