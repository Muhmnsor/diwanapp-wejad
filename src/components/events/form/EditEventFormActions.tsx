import { Button } from "@/components/ui/button";

interface EditEventFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const EditEventFormActions = ({
  onSave,
  onCancel,
  isLoading
}: EditEventFormActionsProps) => {
  return (
    <div className="flex justify-start gap-2 mt-6 text-right" dir="rtl">
      <Button
        onClick={onSave}
        disabled={isLoading}
        className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "جاري التحديث..." : "تحديث الفعالية"}
      </Button>
      <Button
        onClick={onCancel}
        disabled={isLoading}
        variant="outline"
      >
        إلغاء
      </Button>
    </div>
  );
};