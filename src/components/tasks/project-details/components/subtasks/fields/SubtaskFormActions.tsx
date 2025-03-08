
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الإضافة...
          </>
        ) : (
          "إضافة"
        )}
      </Button>
    </div>
  );
};
