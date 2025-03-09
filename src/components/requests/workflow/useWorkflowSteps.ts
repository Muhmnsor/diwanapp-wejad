
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep, User } from "../types";
import { getInitialStepState } from "./utils";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
}

export const useWorkflowSteps = ({ requestTypeId, onWorkflowStepsUpdated }: UseWorkflowStepsProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(0));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users and existing workflow steps on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("is_active", true);

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch existing workflow steps if requestTypeId is provided
        if (requestTypeId) {
          const { data: workflowData, error: workflowError } = await supabase
            .from("request_workflows")
            .select("id")
            .eq("request_type_id", requestTypeId)
            .single();

          if (workflowData) {
            const { data: stepsData, error: stepsError } = await supabase
              .from("workflow_steps")
              .select("*")
              .eq("workflow_id", workflowData.id)
              .order("step_order", { ascending: true });

            if (stepsError) throw stepsError;
            setWorkflowSteps(stepsData || []);
            onWorkflowStepsUpdated(stepsData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [requestTypeId, onWorkflowStepsUpdated]);

  const resetStepForm = () => {
    setCurrentStep(getInitialStepState(workflowSteps.length));
    setEditingStepIndex(null);
  };

  const handleAddStep = () => {
    if (!currentStep.step_name) {
      return; // Validate required fields
    }

    const updatedSteps = [...workflowSteps];

    if (editingStepIndex !== null) {
      // Update existing step
      updatedSteps[editingStepIndex] = {
        ...updatedSteps[editingStepIndex],
        ...currentStep,
      };
    } else {
      // Add new step
      updatedSteps.push({
        ...currentStep,
        step_order: workflowSteps.length,
      });
    }

    // Reorder steps to ensure order is consecutive
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      step_order: index,
    }));

    setWorkflowSteps(reorderedSteps);
    onWorkflowStepsUpdated(reorderedSteps);
    resetStepForm();
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = workflowSteps.filter((_, i) => i !== index);
    // Reorder steps to ensure order is consecutive
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      step_order: index,
    }));
    
    setWorkflowSteps(reorderedSteps);
    onWorkflowStepsUpdated(reorderedSteps);
  };

  const handleEditStep = (index: number) => {
    setCurrentStep(workflowSteps[index]);
    setEditingStepIndex(index);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return; // Can't move further in this direction
    }

    const updatedSteps = [...workflowSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the steps
    [updatedSteps[index], updatedSteps[targetIndex]] = [updatedSteps[targetIndex], updatedSteps[index]];
    
    // Reorder steps to ensure order is consecutive
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      step_order: idx,
    }));
    
    setWorkflowSteps(reorderedSteps);
    onWorkflowStepsUpdated(reorderedSteps);
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
