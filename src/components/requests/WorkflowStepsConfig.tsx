
import React, { useEffect } from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  console.log("Rendering WorkflowStepsConfig with:", {
    requestTypeId,
    initialSteps: initialSteps?.length,
    workflowId
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
    initialSteps,
    initialWorkflowId: workflowId
  });

  // Display error if there's any
  useEffect(() => {
    if (error) {
      console.error("WorkflowStepsConfig error:", error);
      toast.error(`خطأ في إدارة خطوات سير العمل: ${error}`);
    }
  }, [error]);

  // Update parent component whenever workflow steps change
  useEffect(() => {
    if (Array.isArray(workflowSteps)) {
      console.log("WorkflowStepsConfig updating parent with steps:", workflowSteps);
      onWorkflowStepsUpdated(workflowSteps);
    }
  }, [workflowSteps, onWorkflowStepsUpdated]);

  const handleAddStepSafely = () => {
    try {
      if (!currentStep.step_name) {
        toast.error('يرجى إدخال اسم الخطوة');
        return;
      }
      
      if (!currentStep.approver_id) {
        toast.error('يرجى اختيار المعتمد');
        return;
      }
      
      handleAddStep();
    } catch (error) {
      console.error("Error adding step:", error);
      toast.error('حدث خطأ أثناء إضافة الخطوة');
    }
  };

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
        onAddStep={handleAddStepSafely}
      />
      
      {workflowSteps.length === 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            لم يتم إضافة أي خطوات بعد. الرجاء إضافة خطوة واحدة على الأقل لسير العمل.
          </AlertDescription>
        </Alert>
      )}
      
      <StepsList
        workflowSteps={workflowSteps || []}
        users={users}
        onMoveStep={handleMoveStep}
        onEditStep={handleEditStep}
        onRemoveStep={handleRemoveStep}
      />
    </div>
  );
};
