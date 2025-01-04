import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

interface EligibilityResultProps {
  isEligible: boolean;
  reason?: string;
}

export const EligibilityResult = ({
  isEligible,
  reason
}: EligibilityResultProps) => {
  return (
    <Alert variant={isEligible ? "default" : "destructive"}>
      <div className="flex items-center gap-2">
        {isEligible ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4" />
        )}
        <AlertDescription>
          {isEligible ? 'مؤهل للحصول على الشهادة' : reason || 'غير مؤهل للحصول على الشهادة'}
        </AlertDescription>
      </div>
    </Alert>
  );
};