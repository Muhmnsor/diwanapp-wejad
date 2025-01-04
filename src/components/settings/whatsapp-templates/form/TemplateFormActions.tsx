import { Button } from "@/components/ui/button";

interface TemplateFormActionsProps {
  onValidate: () => void;
  onPreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  isLoading?: boolean;
  isValidating?: boolean;
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
        type="button" 
        variant="outline"
        onClick={onValidate}
        disabled={isLoading || !content || isValidating}
      >
        {isValidating ? 'جاري التحقق...' : 'تحقق من القالب'}
      </Button>
      <Button 
        type="button" 
        variant="outline"
        onClick={onPreview}
        disabled={isLoading || !content || isValidating}
      >
        معاينة
      </Button>
      <Button 
        type="submit"
        disabled={isLoading || isValidating}
        onClick={onSubmit}
      >
        {isLoading ? 'جاري الحفظ...' : isEditing ? 'تحديث' : 'إضافة'}
      </Button>
    </div>
  );
};