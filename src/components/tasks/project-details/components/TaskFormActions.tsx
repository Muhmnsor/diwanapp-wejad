
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TaskFormActions = ({ isSubmitting, onCancel }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
      </Button>
    </div>
  );
};
