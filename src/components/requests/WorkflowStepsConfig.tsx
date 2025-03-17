
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkflowStepsConfigProps {
  workflowType?: string | null | undefined;
  requestTypeId?: string;
  workflowId?: string;
  initialSteps?: any[];
  onWorkflowStepsUpdated?: (steps: any[]) => void;
  onWorkflowSaved?: () => void;
  standalone?: boolean;
}

export const WorkflowStepsConfig = ({ 
  workflowType,
  requestTypeId,
  workflowId,
  initialSteps,
  onWorkflowStepsUpdated,
  onWorkflowSaved,
  standalone 
}: WorkflowStepsConfigProps) => {
  // If standalone is true, we don't require workflowType
  if (!workflowType && !standalone) {
    return (
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>عفواً</AlertTitle>
        <AlertDescription>
          لم يتم تحديد نوع سير العمل بعد. يرجى اختيار نوع سير العمل المناسب للطلب.
        </AlertDescription>
      </Alert>
    );
  }

  // Implementation for workflow steps config would go here
  return null;
};
