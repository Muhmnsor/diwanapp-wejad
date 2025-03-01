
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export const FormActions = ({ onCancel, isLoading, isEdit = false }: FormActionsProps) => {
  return (
    <div className="flex gap-2 justify-start">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : isEdit ? "تعديل المورد" : "إضافة المورد"}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        إلغاء
      </Button>
    </div>
  );
};
