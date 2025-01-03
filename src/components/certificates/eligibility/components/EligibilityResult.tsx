import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface EligibilityResultProps {
  isEligible: boolean;
  reason?: string;
}

export const EligibilityResult = ({ isEligible, reason }: EligibilityResultProps) => {
  return (
    <Alert variant={isEligible ? "default" : "destructive"}>
      {isEligible ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {isEligible ? "مؤهل للحصول على الشهادة" : "غير مؤهل للحصول على الشهادة"}
      </AlertTitle>
      {reason && <AlertDescription>{reason}</AlertDescription>}
    </Alert>
  );
};