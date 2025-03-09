
import { useState, useEffect, useCallback } from "react";
import { WorkflowStep, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "./utils";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
}

export const useWorkflowSteps = ({ 
  requestTypeId,
  onWorkflowStepsUpdated
}: UseWorkflowStepsProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(1));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users for approver selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true);

        if (error) throw error;
        
        setUsers(data.map(user => ({
          id: user.id,
          display_name: user.display_name || user.email,
          email: user.email
        })));
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('فشل في جلب قائمة المستخدمين');
      }
    };

    fetchUsers();
  }, []);

  // Fetch workflow steps when request type changes
  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!requestTypeId) {
        // For new request types, just initialize with empty steps
        setWorkflowSteps([]);
        setWorkflowId(null);
        return;
      }

      setIsLoading(true);

      try {
        // First, get the default workflow ID for this request type
        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('default_workflow_id')
          .eq('id', requestTypeId)
          .single();

        if (requestTypeError) throw requestTypeError;

        const workflowId = requestType.default_workflow_id;
        setWorkflowId(workflowId);

        if (!workflowId) {
          setWorkflowSteps([]);
          setIsLoading(false);
          return;
        }

        // Then, fetch the workflow steps
        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;
        
        setWorkflowSteps(steps || []);
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
        toast.error('فشل في جلب خطوات سير العمل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowSteps();
  }, [requestTypeId]);

  // Create or update a workflow for the request type
  const ensureWorkflowExists = async (): Promise<string> => {
    if (workflowId) return workflowId;

    try {
      // For a new request type, we can't create the workflow yet since the request type doesn't exist
      // We'll return a temporary ID that will be replaced when the actual workflow is created
      if (!requestTypeId || requestTypeId === 'temp-id') {
        return 'temp-workflow-id';
      }

      // Create a new workflow if one doesn't exist
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

      // Update the request type with the new workflow
      const { error: updateError } = await supabase
        .from('request_types')
        .update({ default_workflow_id: newWorkflow.id })
        .eq('id', requestTypeId);

      if (updateError) throw updateError;

      setWorkflowId(newWorkflow.id);
      return newWorkflow.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('فشل في إنشاء مسار العمل');
      throw error;
    }
  };

  // Save workflow steps to local state first
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
    
    // Notify parent component about the updated steps
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(steps);
    }
  }, [onWorkflowStepsUpdated]);

  // Save workflow steps to database 
  const saveWorkflowSteps = async (steps: WorkflowStep[]) => {
    if (!requestTypeId || requestTypeId === 'temp-id') {
      // For new request types, just update the local state
      updateWorkflowSteps(steps);
      return;
    }
    
    setIsLoading(true);

    try {
      // Ensure workflow exists
      const currentWorkflowId = await ensureWorkflowExists();

      // Skip database operations if we have a temporary workflow ID
      if (currentWorkflowId === 'temp-workflow-id') {
        updateWorkflowSteps(steps);
        setIsLoading(false);
        return;
      }

      // Delete existing steps
      if (steps.length > 0) {
        const { error: deleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', currentWorkflowId);

        if (deleteError) throw deleteError;
      }

      // Insert new steps if there are any
      if (steps.length > 0) {
        const stepsToInsert = steps.map((step, index) => ({
          ...step,
          workflow_id: currentWorkflowId,
          step_order: index + 1,
          approver_type: step.approver_type || 'user' // Default to 'user' if not set
        }));

        const { error: insertError } = await supabase
          .from('workflow_steps')
          .insert(stepsToInsert);

        if (insertError) throw insertError;
      }

      // Update local state
      updateWorkflowSteps(steps);
      toast.success('تم حفظ خطوات سير العمل بنجاح');
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      toast.error('فشل في حفظ خطوات سير العمل');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new step
  const handleAddStep = () => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }

    if (!currentStep.approver_id) {
      toast.error('يرجى تحديد المسؤول عن الاعتماد');
      return;
    }

    let updatedSteps: WorkflowStep[];

    if (editingStepIndex !== null) {
      // Update existing step
      updatedSteps = [...workflowSteps];
      updatedSteps[editingStepIndex] = { 
        ...currentStep,
        approver_type: currentStep.approver_type || 'user' 
      };
    } else {
      // Add new step
      updatedSteps = [...workflowSteps, { 
        ...currentStep,
        approver_type: currentStep.approver_type || 'user' 
      }];
    }

    saveWorkflowSteps(updatedSteps);
    setCurrentStep(getInitialStepState(updatedSteps.length + 1));
    setEditingStepIndex(null);
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    const updatedSteps = workflowSteps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step_order: i + 1
    }));
    
    saveWorkflowSteps(updatedSteps);

    if (editingStepIndex === index) {
      setEditingStepIndex(null);
      setCurrentStep(getInitialStepState(updatedSteps.length + 1));
    }
  };

  // Edit a step
  const handleEditStep = (index: number) => {
    setCurrentStep({ ...workflowSteps[index] });
    setEditingStepIndex(index);
  };

  // Move a step up or down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...workflowSteps];
    
    // Swap steps
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Update step orders
    updatedSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });

    saveWorkflowSteps(updatedSteps);
    
    // Update editing index if needed
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
  };

  return {
    workflowSteps,
    currentStep,
    editingStepIndex,
    users,
    isLoading,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
  };
};
