import { useState, useEffect, useCallback } from "react";
import { WorkflowStep, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "./utils";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
  initialSteps?: WorkflowStep[];
  initialWorkflowId?: string | null;
}

export const useWorkflowSteps = ({ 
  requestTypeId,
  onWorkflowStepsUpdated,
  initialSteps = [],
  initialWorkflowId = null
}: UseWorkflowStepsProps) => {
  const [workflowId, setWorkflowId] = useState<string | null>(initialWorkflowId || null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(1, workflowId || ''));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if ((initialSteps && initialSteps.length > 0 && !initialized) || 
        (initialWorkflowId && !initialized)) {
      console.log("Initializing workflow steps with:", { 
        initialSteps, 
        initialWorkflowId 
      });
      
      const effectiveWorkflowId = initialWorkflowId || 
                                  (initialSteps[0]?.workflow_id) || 
                                  'temp-workflow-id';
      
      console.log("Using workflow ID for initialization:", effectiveWorkflowId);
      
      const stepsWithWorkflowId = initialSteps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || effectiveWorkflowId
      }));
      
      setWorkflowSteps(stepsWithWorkflowId);
      setCurrentStep({
        ...getInitialStepState(initialSteps.length + 1),
        workflow_id: effectiveWorkflowId
      });
      
      setWorkflowId(effectiveWorkflowId);
      setInitialized(true);
    }
  }, [initialSteps, initialWorkflowId, initialized]);

  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!requestTypeId && !workflowId) {
        if (!initialized && initialSteps.length > 0) {
          const workflowIdToUse = initialWorkflowId || 
                                  initialSteps[0]?.workflow_id || 
                                  'temp-workflow-id';
          
          console.log("No request type ID, using workflowId:", workflowIdToUse);
          
          const stepsWithWorkflowId = initialSteps.map(step => ({
            ...step,
            workflow_id: step.workflow_id || workflowIdToUse
          }));
          
          setWorkflowSteps(stepsWithWorkflowId);
          setWorkflowId(workflowIdToUse);
          setInitialized(true);
        } else if (!initialized) {
          setWorkflowSteps([]);
          setWorkflowId('temp-workflow-id');
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (workflowId && workflowId !== 'temp-workflow-id') {
          console.log("Using existing workflow ID for fetching steps:", workflowId);
          
          const { data: steps, error: stepsError } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('step_order', { ascending: true });

          if (stepsError) throw stepsError;
          
          console.log("Fetched workflow steps:", steps);
          
          const stepsWithWorkflowId = steps ? steps.map(step => ({
            ...step,
            workflow_id: workflowId
          })) : [];
          
          setWorkflowSteps(stepsWithWorkflowId);
          setCurrentStep({
            ...getInitialStepState(stepsWithWorkflowId.length + 1),
            workflow_id: workflowId
          });
          setInitialized(true);
          return;
        }

        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('default_workflow_id')
          .eq('id', requestTypeId)
          .single();

        if (requestTypeError) throw requestTypeError;

        const workflow_id = requestType?.default_workflow_id || 'temp-workflow-id';
        console.log("Got workflow ID from request type:", workflow_id);
        setWorkflowId(workflow_id);

        if (!requestType?.default_workflow_id) {
          if (!initialized && initialSteps.length > 0) {
            const stepsWithWorkflowId = initialSteps.map(step => ({
              ...step,
              workflow_id
            }));
            setWorkflowSteps(stepsWithWorkflowId);
          } else if (!initialized) {
            setWorkflowSteps([]);
          }
          setCurrentStep({
            ...getInitialStepState(workflowSteps.length + 1),
            workflow_id
          });
          setInitialized(true);
          return;
        }

        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflow_id)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;
        
        console.log("Fetched workflow steps:", steps);
        
        const stepsWithWorkflowId = steps ? steps.map(step => ({
          ...step,
          workflow_id
        })) : [];
        
        setWorkflowSteps(stepsWithWorkflowId);
        setCurrentStep({
          ...getInitialStepState(stepsWithWorkflowId.length + 1),
          workflow_id
        });
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
        toast.error('فشل في جلب خطوات سير العمل');
        setError('فشل في جلب خطوات سير العمل');
        
        if (!initialized && initialSteps.length > 0) {
          const workflow_id = workflowId || 'temp-workflow-id';
          const stepsWithWorkflowId = initialSteps.map(step => ({
            ...step,
            workflow_id
          }));
          setWorkflowSteps(stepsWithWorkflowId);
          setInitialized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialized) {
      fetchWorkflowSteps();
    }
  }, [requestTypeId, workflowId, initialSteps, initialized, initialWorkflowId]);

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
  }, [onWorkflowStepsUpdated, workflowId]);

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

  const handleAddStep = () => {
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

  const handleRemoveStep = (index: number) => {
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

  const handleEditStep = (index: number) => {
    console.log("Editing step at index:", index);
    const stepToEdit = {
      ...workflowSteps[index],
      workflow_id: workflowSteps[index].workflow_id || workflowId || 'temp-workflow-id'
    };
    setCurrentStep(stepToEdit);
    setEditingStepIndex(index);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
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
    workflowId
  };
};
