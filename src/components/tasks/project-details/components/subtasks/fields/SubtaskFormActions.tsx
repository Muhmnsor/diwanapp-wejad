
import { Button } from "@/components/ui/button";

interface SubtaskFormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isValid: boolean;
}

export const SubtaskFormActions = ({ onCancel, isLoading = false, isValid }: SubtaskFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        إلغاء
      </Button>
      <Button type="submit" size="sm" disabled={isLoading || !isValid}>
        {isLoading ? "جاري الإضافة..." : "إضافة"}
      </Button>
    </div>
  );
};
