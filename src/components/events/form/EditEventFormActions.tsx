import { Button } from "@/components/ui/button";

interface EditEventFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditEventFormActions = ({ onSave, onCancel, isLoading }: EditEventFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        إلغاء
      </Button>
      <Button 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </Button>
    </div>
  );
};