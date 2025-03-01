
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

export const FormActions = ({ onCancel, isLoading }: FormActionsProps) => {
  return (
    <div className="flex gap-2 justify-start">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "إضافة المورد"}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        إلغاء
      </Button>
    </div>
  );
};
