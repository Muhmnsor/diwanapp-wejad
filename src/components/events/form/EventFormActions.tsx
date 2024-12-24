import { Button } from "@/components/ui/button";

interface EventFormActionsProps {
  isUploading: boolean;
  onCancel: () => void;
}

export const EventFormActions = ({ isUploading, onCancel }: EventFormActionsProps) => {
  return (
    <div className="flex justify-start gap-2 sticky bottom-0 bg-background py-4">
      <Button 
        type="submit"
        disabled={isUploading}
      >
        {isUploading ? "جاري الرفع..." : "حفظ التغييرات"}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isUploading}
      >
        إلغاء
      </Button>
    </div>
  );
};