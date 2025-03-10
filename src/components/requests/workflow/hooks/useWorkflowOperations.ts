
import { useCallback } from "react";
import { WorkflowStep } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "../utils";

interface UseWorkflowOperationsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
}

export const useWorkflowOperations = ({
  requestTypeId,
  workflowId,
  setWorkflowId,
  setWorkflowSteps,
  setCurrentStep,
  setEditingStepIndex,
  setIsLoading,
  setError,
  onWorkflowStepsUpdated
}: UseWorkflowOperationsProps) => {
  
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    console.log("Updating workflow steps locally:", steps);
    
    const currentWorkflowId = workflowId || 'temp-workflow-id';
    const stepsWithWorkflowId = steps.map(step => ({
      ...step,
      workflow_id: step.workflow_id || currentWorkflowId
    }));
    
    setWorkflowSteps(stepsWithWorkflowId);
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(stepsWithWorkflowId);
    }
  }, [onWorkflowStepsUpdated, workflowId, setWorkflowSteps]);

  const ensureWorkflowExists = async (): Promise<string> => {
    if (workflowId && workflowId !== 'temp-workflow-id') {
      console.log("Using existing workflow ID:", workflowId);
      return workflowId;
    }

    try {
      if (!requestTypeId) {
        console.log("No request type ID, returning temporary workflow ID");
        return 'temp-workflow-id';
      }

      console.log("Creating new workflow for request type:", requestTypeId);
      
      const { data: newWorkflow, error: createError } = await supabase
        .from('request_workflows')
        .insert({
          name: 'مسار افتراضي',
          request_type_id: requestTypeId,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      const newWorkflowId = newWorkflow.id;
      console.log("Created new workflow with ID:", newWorkflowId);
      setWorkflowId(newWorkflowId);
      
      setWorkflowSteps(prevSteps => 
        prevSteps.map(step => ({
          ...step,
          workflow_id: newWorkflowId
        }))
      );
      
      setCurrentStep(prevStep => ({
        ...prevStep,
        workflow_id: newWorkflowId
      }));
      
      return newWorkflowId;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('فشل في إنشاء مسار العمل');
      setError('فشل في إنشاء مسار العمل');
      throw error;
    }
  };

  const saveWorkflowSteps = async (steps: WorkflowStep[]) => {
    if (!requestTypeId) {
      console.log("Saving steps locally for new request type:", steps);
      
      const currentWorkflowId = workflowId || 'temp-workflow-id';
      const stepsWithWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || currentWorkflowId
      }));
      
      updateWorkflowSteps(stepsWithWorkflowId);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const currentWorkflowId = await ensureWorkflowExists();
      console.log("Working with workflow ID:", currentWorkflowId);

      if (currentWorkflowId === 'temp-workflow-id') {
        console.log("Using temporary workflow ID, saving steps locally only");
        
        const stepsWithWorkflowId = steps.map(step => ({
          ...step,
          workflow_id: currentWorkflowId
        }));
        
        updateWorkflowSteps(stepsWithWorkflowId);
        setIsLoading(false);
        return;
      }

      if (steps.length === 0) {
        updateWorkflowSteps([]);
        setIsLoading(false);
        return;
      }
      
      const stepsToInsert = steps.map((step, index) => ({
        ...step,
        workflow_id: currentWorkflowId,
        step_order: index + 1,
        step_type: step.step_type || 'decision',
        is_required: step.is_required === false ? false : true,
        approver_type: step.approver_type || 'user'
      }));

      console.log("Inserting workflow steps using RPC bypass function with workflow_id:", currentWorkflowId);
      console.log("Steps to insert:", stepsToInsert);
      
      if (stepsToInsert.some(step => !step.workflow_id)) {
        console.error("Cannot insert steps with missing workflow_id");
        throw new Error("بعض الخطوات تفتقد إلى معرّف سير العمل");
      }
      
      const jsonSteps = stepsToInsert.map(step => JSON.stringify(step));
      
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('insert_workflow_steps', {
          steps: jsonSteps
        });

      if (rpcError) {
        console.error("Error inserting workflow steps via RPC:", rpcError);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${rpcError.message}`);
      }

      console.log("RPC function result:", rpcResult);

      if (!rpcResult || !rpcResult.success) {
        const errorMessage = rpcResult?.error || rpcResult?.message || 'حدث خطأ غير معروف';
        console.error("Error returned from RPC function:", errorMessage);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${errorMessage}`);
      }

      console.log("Successfully inserted workflow steps via RPC:", rpcResult);
      
      if (rpcResult.data && Array.isArray(rpcResult.data)) {
        updateWorkflowSteps(rpcResult.data);
      } else {
        updateWorkflowSteps(stepsToInsert);
      }

      toast.success('تم حفظ خطوات سير العمل بنجاح');
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      toast.error(error.message || 'فشل في حفظ خطوات سير العمل');
      setError(error.message || 'فشل في حفظ خطوات سير العمل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = (currentStep: WorkflowStep, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
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
    
    saveWorkflowSteps(updatedSteps);
    
    setCurrentStep({
      ...getInitialStepState(updatedSteps.length + 1),
      workflow_id: current_workflow_id
    });
    setEditingStepIndex(null);
  };

  const handleRemoveStep = (index: number, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
    const updatedSteps = workflowSteps
      .filter((_, i) => i !== index)
      .map((step, i) => ({
        ...step,
        step_order: i + 1,
        workflow_id: step.workflow_id || workflowId || 'temp-workflow-id'
      }));
    
    console.log("Removing step at index:", index);
    console.log("Updated steps after removal:", updatedSteps);
    
    saveWorkflowSteps(updatedSteps);

    if (editingStepIndex === index) {
      setEditingStepIndex(null);
      setCurrentStep({
        ...getInitialStepState(updatedSteps.length + 1),
        workflow_id: workflowId || 'temp-workflow-id'
      });
    }
  };

  const handleEditStep = (index: number, workflowSteps: WorkflowStep[]) => {
    console.log("Editing step at index:", index);
    const stepToEdit = {
      ...workflowSteps[index],
      workflow_id: workflowSteps[index].workflow_id || workflowId || 'temp-workflow-id'
    };
    setCurrentStep(stepToEdit);
    setEditingStepIndex(index);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down', workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
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
    
    saveWorkflowSteps(updatedSteps);
    
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
  };

  return {
    updateWorkflowSteps,
    saveWorkflowSteps,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
