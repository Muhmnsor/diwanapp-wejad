
import React, { useEffect } from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
  initialSteps?: WorkflowStep[];
  workflowId?: string | null;
}

export const WorkflowStepsConfig = ({ 
  requestTypeId, 
  onWorkflowStepsUpdated,
  initialSteps = [],
  workflowId = null
}: WorkflowStepsConfigProps) => {
  // Ensure initialSteps is always an array
  const safeInitialSteps = Array.isArray(initialSteps) ? initialSteps : [];
  
  console.log("WorkflowStepsConfig mount with props:", { 
    requestTypeId, 
    workflowId,
    initialStepsCount: safeInitialSteps.length 
  });
  
  const {
    workflowSteps,
    currentStep,
    editingStepIndex,
    users,
    isLoading,
    error,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
  } = useWorkflowSteps({ 
    requestTypeId, 
    onWorkflowStepsUpdated,
    initialSteps: safeInitialSteps,
    initialWorkflowId: workflowId
  });

  // Display error if there's any
  useEffect(() => {
    if (error) {
      console.error("Workflow Steps Error:", error);
      toast.error(`خطأ في إدارة خطوات سير العمل: ${error}`);
    }
  }, [error]);

  // Update parent component whenever workflow steps change
  useEffect(() => {
    if (Array.isArray(workflowSteps)) {
      console.log("WorkflowStepsConfig updating parent with steps:", workflowSteps.length);
      onWorkflowStepsUpdated(workflowSteps);
    }
  }, [workflowSteps, onWorkflowStepsUpdated]);

  // Safely get workflow steps as array
  const safeWorkflowSteps = Array.isArray(workflowSteps) ? workflowSteps : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خطوات سير العمل</h3>
      </div>
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <StepForm
        currentStep={currentStep}
        editingStepIndex={editingStepIndex}
        users={users}
        isLoading={isLoading}
        onStepChange={setCurrentStep}
        onAddStep={handleAddStep}
      />
      
      <StepsList
        workflowSteps={safeWorkflowSteps}
        users={users}
        onMoveStep={handleMoveStep}
        onEditStep={handleEditStep}
        onRemoveStep={handleRemoveStep}
      />
    </div>
  );
};
