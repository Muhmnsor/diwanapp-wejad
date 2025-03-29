
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
    <div className="flex justify-end gap-2 mt-8">
      <Button variant="outline" onClick={onClose} type="button">
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <span>جاري الحفظ...</span>
        ) : mode === 'edit' ? (
          'تحديث التقرير'
        ) : (
          'حفظ التقرير'
        )}
      </Button>
    </div>
  );
};
