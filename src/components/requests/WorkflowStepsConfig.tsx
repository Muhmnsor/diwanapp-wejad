import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkflowStepsConfigProps {
  workflowType: string | null | undefined;
}

export const WorkflowStepsConfig = ({ workflowType }: WorkflowStepsConfigProps) => {
  if (!workflowType) {
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

  return null;
};
