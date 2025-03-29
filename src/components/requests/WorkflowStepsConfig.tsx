
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    resetWorkflowState,
    workflowId: currentWorkflowId
  } = useWorkflowSteps({
    requestTypeId: requestTypeId || null,
    onWorkflowStepsUpdated,
    initialSteps,
    initialWorkflowId: workflowId
  });

  // Handle successful saving
  const handleSave = async () => {
    const success = await saveWorkflowSteps(workflowSteps);
    if (success && onWorkflowSaved) {
      onWorkflowSaved();
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">إعداد خطوات سير العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step Form */}
            <div>
              <h3 className="text-md font-medium mb-3">
                {editingStepIndex !== null ? 'تعديل الخطوة' : 'إضافة خطوة جديدة'}
              </h3>
              <StepForm
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                onAddStep={handleAddStep}
                editingStepIndex={editingStepIndex}
                users={users}
                isLoading={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-muted-foreground text-xs">
                  خطوات سير العمل
                </span>
              </div>
            </div>

            {/* Steps List */}
            <StepsList
              workflowSteps={workflowSteps}
              users={users}
              onMoveStep={handleMoveStep}
              onEditStep={handleEditStep}
              onRemoveStep={handleRemoveStep}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
