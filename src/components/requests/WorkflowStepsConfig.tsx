
import React, { useEffect, useState } from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
  onWorkflowSaved?: () => void; // Callback for when workflow is successfully saved
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
      toast.error(`خطأ في إدارة خطوات سير العمل: ${error.message || 'حدث خطأ غير معروف'}`);
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
      console.log("Saving workflow steps to database, current workflow ID:", currentWorkflowId);
      
      // Force all steps to have the correct workflow ID
      const stepsToSave = workflowSteps.map(step => ({
        ...step,
        workflow_id: currentWorkflowId !== 'temp-workflow-id' ? currentWorkflowId : step.workflow_id
      }));
      
      await saveWorkflowSteps(stepsToSave);
      
      toast.success('تم حفظ خطوات سير العمل بنجاح');
      if (onWorkflowSaved) {
        onWorkflowSaved();
      }
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حفظ خطوات سير العمل');
    }
  };

  // Handle update step from form
  const handleUpdateStep = (updatedStep: WorkflowStep) => {
    setCurrentStep(updatedStep);
  };

  // Handle save step from form
  const handleSaveStep = () => {
    const updatedSteps = [...workflowSteps];
    
    if (editingStepIndex !== null) {
      // Update existing step
      updatedSteps[editingStepIndex] = {
        ...currentStep,
        workflow_id: currentWorkflowId || 'temp-workflow-id'
      };
    } else {
      // Add new step
      updatedSteps.push({
        ...currentStep,
        id: currentStep.id || uuidv4(),
        workflow_id: currentWorkflowId || 'temp-workflow-id',
        step_order: workflowSteps.length
      });
    }
    
    onWorkflowStepsUpdated(updatedSteps);
    
    // Reset current step
    handleAddStep();
  };

  // Add a message to prompt users to save when in standalone mode and steps exist
  const showSavePrompt = standalone && workflowSteps.length > 0 && !isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خطوات سير العمل</h3>
        {/* Debug info - workflowId */}
        <div className="text-xs text-gray-400">
          {currentWorkflowId ? `معرّف سير العمل: ${currentWorkflowId}` : 'لا يوجد معرّف سير العمل'}
        </div>
      </div>
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'حدث خطأ غير معروف'}
          </AlertDescription>
        </Alert>
      )}
      
      {workflowSteps.length > 0 && currentWorkflowId === 'temp-workflow-id' && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertDescription>
            تعمل حالياً في الوضع المؤقت. يجب حفظ الخطوات لإنشاء سير العمل في قاعدة البيانات.
          </AlertDescription>
        </Alert>
      )}
      
      {showSavePrompt && (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertDescription>
            لديك خطوات غير محفوظة. لا تنس الضغط على زر "حفظ خطوات سير العمل" في الأسفل عند الانتهاء.
          </AlertDescription>
        </Alert>
      )}
      
      <StepForm
        step={currentStep}
        editingIndex={editingStepIndex}
        users={users}
        isLoading={isLoading}
        onUpdateStep={handleUpdateStep}
        onSaveStep={handleSaveStep}
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
          <h4 className="text-sm font-medium mb-2">معلومات التشخيص:</h4>
          <div className="text-xs font-mono overflow-auto max-h-40">
            <div>معرّف نوع الطلب: {requestTypeId || 'غير موجود'}</div>
            <div>معرّف سير العمل: {currentWorkflowId || 'غير موجود'}</div>
            <div>عدد الخطوات: {workflowSteps.length}</div>
            <div>الخطوة التي يتم تحريرها: {editingStepIndex !== null ? editingStepIndex : 'لا يوجد'}</div>
            <div>جاري التحميل: {isLoading ? 'نعم' : 'لا'}</div>
            <div>خطأ: {error ? (error.message || String(error)) : 'لا يوجد'}</div>
            <div className="mt-2">حالة الخطوات:</div>
            <div className="pl-4">
              {workflowSteps.map((step, index) => (
                <div key={index} className="mt-1">
                  خطوة {index + 1}: {step.step_name} 
                  <span className="ml-2 text-blue-500">
                    [معرّف سير العمل: {step.workflow_id || 'غير محدد'}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
