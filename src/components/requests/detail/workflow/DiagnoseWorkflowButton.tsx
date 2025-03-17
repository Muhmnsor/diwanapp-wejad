
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertCircle, Loader2, Wrench } from "lucide-react";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onFixWorkflow: () => Promise<void>;
}

export const DiagnoseWorkflowButton = ({
  requestId,
  onFixWorkflow
}: DiagnoseWorkflowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onFixWorkflow();
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
      className="gap-1"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wrench className="h-3.5 w-3.5" />
      )}
      <span className="ml-1.5">إصلاح سير العمل</span>
    </Button>
  );
};
