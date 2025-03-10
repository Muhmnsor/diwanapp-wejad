
import { useState, useEffect, useCallback } from "react";
import { WorkflowStep, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "./utils";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
  initialSteps?: WorkflowStep[];
}

export const useWorkflowSteps = ({ 
  requestTypeId,
  onWorkflowStepsUpdated,
  initialSteps = []
}: UseWorkflowStepsProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(1));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
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
        setError('فشل في جلب قائمة المستخدمين');
      }
    };

    fetchUsers();
  }, []);

  // Initialize with initialSteps if provided
  useEffect(() => {
    if (initialSteps && initialSteps.length > 0 && !initialized) {
      console.log("Initializing workflow steps from initialSteps:", initialSteps);
      setWorkflowSteps(initialSteps);
      setCurrentStep(getInitialStepState(initialSteps.length + 1));
      setInitialized(true);
    }
  }, [initialSteps, initialized]);

  // Fetch workflow steps when request type changes
  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!requestTypeId) {
        // For new request types, use initialSteps or empty array
        if (!initialized && initialSteps.length > 0) {
          setWorkflowSteps(initialSteps);
          setInitialized(true);
        } else if (!initialized) {
          setWorkflowSteps([]);
        }
        setWorkflowId(null);
        return;
      }

      setIsLoading(true);
      setError(null);

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
          if (!initialized && initialSteps.length > 0) {
            setWorkflowSteps(initialSteps);
          } else if (!initialized) {
            setWorkflowSteps([]);
          }
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        // Then, fetch the workflow steps
        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;
        
        console.log("Fetched workflow steps:", steps);
        setWorkflowSteps(steps || initialSteps);
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
        toast.error('فشل في جلب خطوات سير العمل');
        setError('فشل في جلب خطوات سير العمل');
        
        // If there's an error, use initialSteps if available
        if (!initialized && initialSteps.length > 0) {
          setWorkflowSteps(initialSteps);
          setInitialized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialized) {
      fetchWorkflowSteps();
    }
  }, [requestTypeId, initialSteps, initialized]);

  // Create or update a workflow for the request type
  const ensureWorkflowExists = async (): Promise<string> => {
    if (workflowId) {
      console.log("Using existing workflow ID:", workflowId);
      return workflowId;
    }

    try {
      // For a new request type, we can't create the workflow yet since the request type doesn't exist
      // We'll return a temporary ID that will be replaced when the actual workflow is created
      if (!requestTypeId) {
        console.log("No request type ID, returning temporary workflow ID");
        return 'temp-workflow-id';
      }

      console.log("Creating new workflow for request type:", requestTypeId);
      
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
      console.log("Created new workflow:", newWorkflow.id);
      return newWorkflow.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('فشل في إنشاء مسار العمل');
      setError('فشل في إنشاء مسار العمل');
      throw error;
    }
  };

  // Save workflow steps to local state first
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    console.log("Updating workflow steps locally:", steps);
    setWorkflowSteps(steps);
    
    // Notify parent component about the updated steps
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(steps);
    }
  }, [onWorkflowStepsUpdated]);

  // Save workflow steps to database 
  const saveWorkflowSteps = async (steps: WorkflowStep[]) => {
    if (!requestTypeId) {
      // For new request types, just update the local state
      console.log("Saving steps locally for new request type:", steps);
      updateWorkflowSteps(steps);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Ensure workflow exists
      const currentWorkflowId = await ensureWorkflowExists();
      console.log("Working with workflow ID:", currentWorkflowId);

      // Skip database operations if we have a temporary workflow ID
      if (currentWorkflowId === 'temp-workflow-id') {
        console.log("Using temporary workflow ID, saving steps locally only");
        updateWorkflowSteps(steps);
        setIsLoading(false);
        return;
      }

      if (steps.length === 0) {
        // No steps to insert, just update local state
        updateWorkflowSteps([]);
        setIsLoading(false);
        return;
      }
      
      // Prepare steps for RPC function with explicit workflow_id
      const stepsToInsert = steps.map((step, index) => ({
        ...step,
        workflow_id: currentWorkflowId,
        step_order: index + 1,
        approver_type: step.approver_type || 'user'
      }));

      console.log("Inserting workflow steps using RPC bypass function with workflow_id:", currentWorkflowId);
      console.log("Steps to insert:", stepsToInsert);
      
      // Convert steps to JSON objects for RPC function
      const jsonSteps = stepsToInsert.map(step => JSON.stringify(step));
      
      // Use the improved RPC function to bypass RLS
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
      
      // Update local state with the data returned from the RPC function
      if (rpcResult.data && Array.isArray(rpcResult.data)) {
        updateWorkflowSteps(rpcResult.data);
      } else {
        // If no proper data returned, just use our local steps
        updateWorkflowSteps(steps);
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

  // Add a new step
  const handleAddStep = () => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }
    
    if (!currentStep.approver_id) {
      toast.error('يرجى اختيار المعتمد');
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

    console.log("Adding/updating step:", currentStep);
    console.log("Updated steps:", updatedSteps);
    
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
    
    console.log("Removing step at index:", index);
    console.log("Updated steps after removal:", updatedSteps);
    
    saveWorkflowSteps(updatedSteps);

    if (editingStepIndex === index) {
      setEditingStepIndex(null);
      setCurrentStep(getInitialStepState(updatedSteps.length + 1));
    }
  };

  // Edit a step
  const handleEditStep = (index: number) => {
    console.log("Editing step at index:", index);
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

    console.log(`Moving step ${index} ${direction} to ${newIndex}`);
    console.log("Updated steps after move:", updatedSteps);
    
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
    error,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
  };
};
