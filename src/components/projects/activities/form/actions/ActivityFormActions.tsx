import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActivityFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

export const ActivityFormActions = ({ onCancel, isLoading }: ActivityFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        إلغاء
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        حفظ
      </Button>
    </div>
  );
};