
import { Button } from "@/components/ui/button";

interface ReportFormActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
}

export const ReportFormActions = ({ 
  isSubmitting, 
  onClose,
  mode = 'create'
}: ReportFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onClose}>
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting 
          ? mode === 'edit' ? "جاري التحديث..." : "جاري الحفظ..." 
          : mode === 'edit' ? "تحديث التقرير" : "حفظ التقرير"
        }
      </Button>
    </div>
  );
};
