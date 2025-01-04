import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TemplateValidationButtonProps {
  onValidate: () => Promise<void>;
  isValidating: boolean;
  content: string;
}

export const TemplateValidationButton = ({
  onValidate,
  isValidating,
  content
}: TemplateValidationButtonProps) => {
  return (
    <Button 
      variant="outline" 
      onClick={onValidate}
      disabled={isValidating || !content}
      className="w-full"
    >
      {isValidating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          جاري التحقق...
        </>
      ) : (
        'التحقق من صحة القالب'
      )}
    </Button>
  );
};