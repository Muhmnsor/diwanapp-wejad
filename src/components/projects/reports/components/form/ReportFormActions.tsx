import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isSubmitting: boolean;
}

export const ReportFormActions = ({
  isSubmitting
}: ReportFormActionsProps) => {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
      </Button>
    </div>
  );
};