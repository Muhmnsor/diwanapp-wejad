
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
  onWorkflowSaved?: () => void; // New callback for when workflow is successfully saved
  initialSteps?: WorkflowStep[];
  workflowId?: string | null;
  standalone?: boolean; // Whether this component is used standalone
}

export const WorkflowStepsConfig = ({ 
  requestTypeId, 
  onWorkflowStepsUpdated,
  onWorkflowSaved,
  initialSteps = [],
  workflowId = null,
  standalone = false
}: WorkflowStepsConfigProps) => {
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
    saveWorkflowSteps,
    workflowId: currentWorkflowId
  } = useWorkflowSteps({ 
    requestTypeId, 
    onWorkflowStepsUpdated,
    initialSteps,
    initialWorkflowId: workflowId
  });

  // Display error if there's any
  useEffect(() => {
    if (error) {
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

  // Function to handle saving workflow when in standalone mode
  const handleSaveWorkflow = async () => {
    if (workflowSteps.length === 0) {
      toast.error('يجب إضافة خطوة واحدة على الأقل لسير العمل');
      return;
    }

    try {
      await saveWorkflowSteps(workflowSteps);
      toast.success('تم حفظ خطوات سير العمل بنجاح');
      if (onWorkflowSaved) {
        onWorkflowSaved();
      }
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      toast.error(error.message || 'فشل في حفظ خطوات سير العمل');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خطوات سير العمل</h3>
        {/* Debug info - workflowId */}
        <div className="text-xs text-gray-400">
          {currentWorkflowId ? `Workflow ID: ${currentWorkflowId}` : 'No Workflow ID'}
        </div>
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
        workflowSteps={workflowSteps}
        users={users}
        onMoveStep={handleMoveStep}
        onEditStep={handleEditStep}
        onRemoveStep={handleRemoveStep}
      />

      {standalone && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSaveWorkflow} 
            disabled={isLoading || workflowSteps.length === 0}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ خطوات سير العمل"}
          </Button>
        </div>
      )}

      {/* Debug info panel */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Debug Information:</h4>
          <div className="text-xs font-mono overflow-auto max-h-40">
            <div>Request Type ID: {requestTypeId || 'None'}</div>
            <div>Workflow ID: {currentWorkflowId || 'None'}</div>
            <div>Steps Count: {workflowSteps.length}</div>
            <div>Editing Step: {editingStepIndex !== null ? editingStepIndex : 'None'}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Error: {error || 'None'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
