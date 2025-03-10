
import { WorkflowStep } from "../../types";
import { toast } from "sonner";
import { getInitialStepState } from "../utils";

interface UseStepManagementProps {
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
}

export const useStepManagement = ({
  saveWorkflowSteps,
  setCurrentStep,
  setEditingStepIndex
}: UseStepManagementProps) => {

  const handleAddStep = (
    currentStep: WorkflowStep,
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }
    
    if (!currentStep.approver_id) {
      toast.error('يرجى اختيار المعتمد');
      return;
    }

    const current_workflow_id = workflowId || 'temp-workflow-id';
    
    const stepWithWorkflowId = {
      ...currentStep,
      workflow_id: current_workflow_id
    };

    console.log("Current workflow ID:", current_workflow_id);
    console.log("Step with workflow ID:", stepWithWorkflowId);

    let updatedSteps: WorkflowStep[];

    if (editingStepIndex !== null) {
      updatedSteps = [...workflowSteps];
      updatedSteps[editingStepIndex] = stepWithWorkflowId;
    } else {
      updatedSteps = [...workflowSteps, stepWithWorkflowId];
    }

    console.log("Adding/updating step with workflow_id:", stepWithWorkflowId);
    console.log("Updated steps:", updatedSteps);
    
    // Actually save the steps
    try {
      saveWorkflowSteps(updatedSteps)
        .then(() => {
          toast.success(editingStepIndex !== null ? 'تم تحديث الخطوة بنجاح' : 'تمت إضافة الخطوة بنجاح');
          
          setCurrentStep({
            ...getInitialStepState(updatedSteps.length + 1),
            workflow_id: current_workflow_id
          });
          setEditingStepIndex(null);
        })
        .catch((error) => {
          toast.error(`فشل في حفظ الخطوة: ${error.message}`);
        });
    } catch (error) {
      console.error("Error during save:", error);
      toast.error(`فشل في حفظ الخطوة: ${error.message}`);
    }
  };

  const handleRemoveStep = (
    index: number,
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    const updatedSteps = workflowSteps
      .filter((_, i) => i !== index)
      .map((step, i) => ({
        ...step,
        step_order: i + 1,
        workflow_id: step.workflow_id || workflowId || 'temp-workflow-id'
      }));
    
    console.log("Removing step at index:", index);
    console.log("Updated steps after removal:", updatedSteps);
    
    saveWorkflowSteps(updatedSteps)
      .then(() => {
        toast.success('تم حذف الخطوة بنجاح');
        
        if (editingStepIndex === index) {
          setEditingStepIndex(null);
          setCurrentStep({
            ...getInitialStepState(updatedSteps.length + 1),
            workflow_id: workflowId || 'temp-workflow-id'
          });
        }
      })
      .catch((error) => {
        toast.error(`فشل في حذف الخطوة: ${error.message}`);
      });
  };

  const handleEditStep = (index: number, workflowSteps: WorkflowStep[], workflowId: string | null) => {
    console.log("Editing step at index:", index);
    const stepToEdit = {
      ...workflowSteps[index],
      workflow_id: workflowSteps[index].workflow_id || workflowId || 'temp-workflow-id'
    };
    setCurrentStep(stepToEdit);
    setEditingStepIndex(index);
  };

  const handleMoveStep = (
    index: number,
    direction: 'up' | 'down',
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...workflowSteps];
    
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    updatedSteps.forEach((step, i) => {
      step.step_order = i + 1;
      step.workflow_id = step.workflow_id || workflowId || 'temp-workflow-id';
    });

    console.log(`Moving step ${index} ${direction} to ${newIndex}`);
    console.log("Updated steps after move:", updatedSteps);
    
    saveWorkflowSteps(updatedSteps)
      .then(() => {
        toast.success(`تم ${direction === 'up' ? 'رفع' : 'خفض'} الخطوة بنجاح`);
        
        if (editingStepIndex === index) {
          setEditingStepIndex(newIndex);
        } else if (editingStepIndex === newIndex) {
          setEditingStepIndex(index);
        }
      })
      .catch((error) => {
        toast.error(`فشل في تحريك الخطوة: ${error.message}`);
      });
  };

  return {
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
