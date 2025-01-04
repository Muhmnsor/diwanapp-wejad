import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TemplateFormActionsProps {
  onValidate: () => Promise<void>;
  onPreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  isLoading: boolean;
  isValidating: boolean;
  content: string;
}

export const TemplateFormActions = ({
  onValidate,
  onPreview,
  onSubmit,
  isEditing,
  isLoading,
  isValidating,
  content
}: TemplateFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        type="submit" 
        disabled={isLoading || isValidating || !content}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          isEditing ? 'تحديث' : 'إضافة'
        )}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPreview}
        disabled={isLoading || !content}
      >
        معاينة
      </Button>
    </div>
  );
};