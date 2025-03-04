
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TaskFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TaskFormActions = ({ isSubmitting, onCancel }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-reverse space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
        إضافة المهمة
      </Button>
    </div>
  );
};
