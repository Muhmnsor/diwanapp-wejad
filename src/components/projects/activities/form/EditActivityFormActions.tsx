import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditActivityFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

export const EditActivityFormActions = ({ 
  onCancel,
  isLoading 
}: EditActivityFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        إلغاء
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الحفظ...
          </span>
        ) : (
          "حفظ التغييرات"
        )}
      </Button>
    </div>
  );
};