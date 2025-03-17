
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertCircle, Loader2, Wrench, Activity } from "lucide-react";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose?: () => Promise<any>;
  onFix: () => Promise<void>;
  onSuccess?: () => Promise<void>;
  isDiagnosing?: boolean;
  diagnosticResult?: any;
  className?: string;
}

export const DiagnoseWorkflowButton = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing = false,
  diagnosticResult,
  className = ""
}: DiagnoseWorkflowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (onDiagnose) {
        await onDiagnose();
      }
      await onFix();
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-1 ${className}`}
      onClick={handleClick}
      disabled={isLoading || isDiagnosing}
    >
      {isLoading || isDiagnosing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wrench className="h-3.5 w-3.5" />
      )}
      <span className="ml-1.5">إصلاح سير العمل</span>
    </Button>
  );
};
