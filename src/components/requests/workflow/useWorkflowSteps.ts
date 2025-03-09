
import { useState, useEffect } from "react";
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
        setWorkflowSteps([]);
        setWorkflowId(null);
        return;
      }

      setIsLoading(true);

      try {
        console.log("Fetching workflow for request type ID:", requestTypeId);
        // First, get the default workflow ID for this request type
        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('default_workflow_id')
          .eq('id', requestTypeId)
          .single();

        if (requestTypeError) {
          console.error("Error fetching request type:", requestTypeError);
          throw requestTypeError;
        }

        const workflowId = requestType?.default_workflow_id;
        console.log("Default workflow ID:", workflowId);
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

        if (stepsError) {
          console.error("Error fetching workflow steps:", stepsError);
          throw stepsError;
        }
        
        console.log("Fetched workflow steps:", steps);
        setWorkflowSteps(steps || []);
        
        // Also call the callback if steps were found
        if (steps && steps.length > 0 && onWorkflowStepsUpdated) {
          onWorkflowStepsUpdated(steps);
        }
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
        toast.error('فشل في جلب خطوات سير العمل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowSteps();
  }, [requestTypeId, onWorkflowStepsUpdated]);

  // Add or update a step in local state only
  const handleAddStep = () => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }

    let updatedSteps: WorkflowStep[];

    if (editingStepIndex !== null) {
      // Update existing step
      updatedSteps = [...workflowSteps];
      updatedSteps[editingStepIndex] = { ...currentStep };
    } else {
      // Add new step
      updatedSteps = [...workflowSteps, { ...currentStep }];
    }

    // Update the step order for all steps
    updatedSteps = updatedSteps.map((step, index) => ({
      ...step,
      step_order: index + 1
    }));

    setWorkflowSteps(updatedSteps);
    
    // Notify parent component about the updated steps
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(updatedSteps);
    }
    
    // Reset the current step form
    setCurrentStep(getInitialStepState(updatedSteps.length + 1));
    setEditingStepIndex(null);
    
    toast.success(editingStepIndex !== null ? 'تم تحديث الخطوة بنجاح' : 'تم إضافة الخطوة بنجاح');
  };

  // Remove a step from local state
  const handleRemoveStep = (index: number) => {
    const updatedSteps = workflowSteps
      .filter((_, i) => i !== index)
      .map((step, i) => ({
        ...step,
        step_order: i + 1
      }));
    
    setWorkflowSteps(updatedSteps);
    
    // Notify parent component
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(updatedSteps);
    }

    if (editingStepIndex === index) {
      setEditingStepIndex(null);
      setCurrentStep(getInitialStepState(updatedSteps.length + 1));
    }
    
    toast.success('تم حذف الخطوة بنجاح');
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

    setWorkflowSteps(updatedSteps);
    
    // Notify parent component
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(updatedSteps);
    }
    
    // Update editing index if needed
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
    
    toast.success(direction === 'up' ? 'تم نقل الخطوة للأعلى' : 'تم نقل الخطوة للأسفل');
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
