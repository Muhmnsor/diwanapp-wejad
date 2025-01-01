import { Button } from "@/components/ui/button";

interface ActivityFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
}

export const ActivityFormActions = ({ 
  onCancel,
  isLoading 
}: ActivityFormActionsProps) => {
  return (
    <div className="flex justify-start gap-2 mt-6">
      <Button 
        type="submit"
        disabled={isLoading}
        className="bg-primary text-white"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        إلغاء
      </Button>
    </div>
  );
};