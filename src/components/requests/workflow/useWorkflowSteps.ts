
import { useState, useEffect } from "react";
import { WorkflowStep, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "./utils";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  workflowId?: string | null;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
}

export const useWorkflowSteps = ({ 
  requestTypeId,
  workflowId: externalWorkflowId,
  onWorkflowStepsUpdated
}: UseWorkflowStepsProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(externalWorkflowId || null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(1));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Update workflowId when it changes externally
  useEffect(() => {
    if (externalWorkflowId !== undefined) {
      setWorkflowId(externalWorkflowId);
    }
  }, [externalWorkflowId]);

  // Fetch workflow steps when request type or workflow ID changes
  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!requestTypeId && !workflowId) {
        setWorkflowSteps([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let workflowIdToUse = workflowId;
        
        // If we have requestTypeId but no workflowId, fetch the default workflow ID for this request type
        if (requestTypeId && !workflowIdToUse) {
          console.log("Fetching workflow for request type ID:", requestTypeId);
          const { data: requestType, error: requestTypeError } = await supabase
            .from('request_types')
            .select('default_workflow_id')
            .eq('id', requestTypeId)
            .single();

          if (requestTypeError) {
            console.error("Error fetching request type:", requestTypeError);
            throw requestTypeError;
          }

          workflowIdToUse = requestType?.default_workflow_id;
          console.log("Default workflow ID:", workflowIdToUse);
          setWorkflowId(workflowIdToUse);
        }

        if (!workflowIdToUse) {
          setWorkflowSteps([]);
          setIsLoading(false);
          return;
        }

        // Then, fetch the workflow steps
        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflowIdToUse)
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
        setError('فشل في جلب خطوات سير العمل');
        toast.error('فشل في جلب خطوات سير العمل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowSteps();
  }, [requestTypeId, workflowId, onWorkflowStepsUpdated]);

  // Save workflow steps to database
  const saveWorkflowSteps = async (steps: WorkflowStep[], workflowIdToUse: string) => {
    if (!workflowIdToUse) {
      console.error("No workflow ID provided for saving steps");
      setError("لا يوجد معرف لسير العمل لحفظ الخطوات");
      return false;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      // First delete any existing steps for this workflow
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflowIdToUse);

      if (deleteError) {
        console.error("Error deleting existing workflow steps:", deleteError);
        throw deleteError;
      }

      if (steps.length === 0) {
        setIsSaving(false);
        return true;
      }

      // Insert new steps with the correct order and workflow ID
      const stepsToInsert = steps.map((step, index) => ({
        workflow_id: workflowIdToUse,
        step_order: index + 1,
        step_name: step.step_name,
        step_type: step.step_type || 'opinion',
        approver_type: step.approver_type || 'user',
        approver_id: step.approver_id,
        instructions: step.instructions,
        is_required: step.is_required
      }));

      const { error: insertError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);

      if (insertError) {
        console.error("Error inserting workflow steps:", insertError);
        throw insertError;
      }

      // Fetch the updated steps
      const { data: updatedSteps, error: fetchError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowIdToUse)
        .order('step_order', { ascending: true });

      if (fetchError) {
        console.error("Error fetching updated workflow steps:", fetchError);
        throw fetchError;
      }

      // Update local state with server data
      setWorkflowSteps(updatedSteps || []);
      
      // Call the callback if provided
      if (onWorkflowStepsUpdated) {
        onWorkflowStepsUpdated(updatedSteps || []);
      }
      
      toast.success('تم حفظ خطوات سير العمل بنجاح');
      return true;
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      setError('فشل في حفظ خطوات سير العمل');
      toast.error('فشل في حفظ خطوات سير العمل');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Add or update a step in local state only
  const handleAddStep = async () => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }

    if (!currentStep.approver_id) {
      toast.error('يرجى تحديد المسؤول عن الاعتماد');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a workflow first if needed (for initial steps)
      if (!workflowId && requestTypeId) {
        const { data: workflow, error } = await supabase
          .from("request_workflows")
          .insert([
            {
              name: `سير عمل مؤقت`,
              description: `سير عمل تلقائي مؤقت`,
              request_type_id: requestTypeId,
              is_active: true,
            },
          ])
          .select();

        if (error) throw error;
        
        // Set the new workflow ID
        if (workflow && workflow.length > 0) {
          setWorkflowId(workflow[0].id);
          
          // Update the request type with this workflow ID
          const { error: updateError } = await supabase
            .from("request_types")
            .update({ default_workflow_id: workflow[0].id })
            .eq("id", requestTypeId);
            
          if (updateError) {
            console.warn("Could not set default workflow:", updateError);
          }
          
          console.log("Created new workflow:", workflow[0].id);
        }
      }

      // Proceed with adding/updating the step
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

      // Save to database if we have a workflow ID
      if (workflowId) {
        const saved = await saveWorkflowSteps(updatedSteps, workflowId);
        if (!saved) {
          throw new Error("فشل في حفظ الخطوات");
        }
      } else {
        // Just update state if we don't have a workflow ID yet
        setWorkflowSteps(updatedSteps);
        
        // Notify parent component about the updated steps
        if (onWorkflowStepsUpdated) {
          onWorkflowStepsUpdated(updatedSteps);
        }
      }
      
      // Reset the current step form
      setCurrentStep(getInitialStepState(updatedSteps.length + 1));
      setEditingStepIndex(null);
      
      toast.success(editingStepIndex !== null ? 'تم تحديث الخطوة بنجاح' : 'تم إضافة الخطوة بنجاح');
    } catch (error) {
      console.error("Error adding/updating step:", error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الخطوة');
      toast.error('فشل في حفظ الخطوة');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a step from local state
  const handleRemoveStep = async (index: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedSteps = workflowSteps
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          ...step,
          step_order: i + 1
        }));
      
      // Save to database if we have a workflow ID
      if (workflowId) {
        const saved = await saveWorkflowSteps(updatedSteps, workflowId);
        if (!saved) {
          throw new Error("فشل في حذف الخطوة");
        }
      } else {
        // Just update state if we don't have a workflow ID yet
        setWorkflowSteps(updatedSteps);
        
        // Notify parent component
        if (onWorkflowStepsUpdated) {
          onWorkflowStepsUpdated(updatedSteps);
        }
      }

      if (editingStepIndex === index) {
        setEditingStepIndex(null);
        setCurrentStep(getInitialStepState(updatedSteps.length + 1));
      }
      
      toast.success('تم حذف الخطوة بنجاح');
    } catch (error) {
      console.error("Error removing step:", error);
      setError('فشل في حذف الخطوة');
      toast.error('فشل في حذف الخطوة');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit a step
  const handleEditStep = (index: number) => {
    setCurrentStep({ ...workflowSteps[index] });
    setEditingStepIndex(index);
  };

  // Move a step up or down
  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updatedSteps = [...workflowSteps];
      
      // Swap steps
      [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
      
      // Update step orders
      updatedSteps.forEach((step, i) => {
        step.step_order = i + 1;
      });

      // Save to database if we have a workflow ID
      if (workflowId) {
        const saved = await saveWorkflowSteps(updatedSteps, workflowId);
        if (!saved) {
          throw new Error("فشل في تحريك الخطوة");
        }
      } else {
        // Just update state if we don't have a workflow ID yet
        setWorkflowSteps(updatedSteps);
        
        // Notify parent component
        if (onWorkflowStepsUpdated) {
          onWorkflowStepsUpdated(updatedSteps);
        }
      }
      
      // Update editing index if needed
      if (editingStepIndex === index) {
        setEditingStepIndex(newIndex);
      } else if (editingStepIndex === newIndex) {
        setEditingStepIndex(index);
      }
      
      toast.success(direction === 'up' ? 'تم نقل الخطوة للأعلى' : 'تم نقل الخطوة للأسفل');
    } catch (error) {
      console.error("Error moving step:", error);
      setError('فشل في تحريك الخطوة');
      toast.error('فشل في تحريك الخطوة');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workflowSteps,
    currentStep,
    editingStepIndex,
    users,
    isLoading,
    isSaving,
    error,
    workflowId,
    setWorkflowId,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
    saveWorkflowSteps
  };
};
