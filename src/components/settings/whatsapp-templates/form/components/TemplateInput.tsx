import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TemplateInputProps {
  content: string;
  onContentChange: (value: string) => void;
  validationError: string | null;
  isLoading?: boolean;
}

export const TemplateInput = ({
  content,
  onContentChange,
  validationError,
  isLoading
}: TemplateInputProps) => {
  return (
    <div className="space-y-2">
      <Label>محتوى الرسالة</Label>
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="أدخل محتوى الرسالة"
        rows={5}
        className="text-right"
        dir="rtl"
        disabled={isLoading}
      />
      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};