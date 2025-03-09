
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequestType, WorkflowStep } from "../types";
import { RequestTypeForm } from "./RequestTypeForm";
import { FormFieldEditor } from "./FormFieldEditor";
import { WorkflowStepsSection } from "./WorkflowStepsSection";
import { supabase } from "@/integrations/supabase/client";
import { requestTypeSchema } from "./schema";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface RequestTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestTypeCreated: () => void;
  requestType?: RequestType | null;
}

export const RequestTypeDialog = ({
  isOpen,
  onClose,
  onRequestTypeCreated,
  requestType = null,
}: RequestTypeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createdRequestTypeId, setCreatedRequestTypeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [savedWorkflowSteps, setSavedWorkflowSteps] = useState<WorkflowStep[]>([]);
  const isEditing = !!requestType;
  
  const form = useForm<RequestTypeFormValues>({
    resolver: zodResolver(requestTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      form_schema: {
        fields: [],
      },
    },
  });

  React.useEffect(() => {
    if (requestType) {
      form.reset({
        name: requestType.name,
        description: requestType.description || "",
        is_active: requestType.is_active,
        form_schema: requestType.form_schema,
      });
      setCreatedRequestTypeId(requestType.id);
      setWorkflowId(requestType.default_workflow_id);
    } else {
      form.reset({
        name: "",
        description: "",
        is_active: true,
        form_schema: {
          fields: [],
        },
      });
      setCreatedRequestTypeId(null);
      setWorkflowId(null);
      setSavedWorkflowSteps([]);
    }
  }, [requestType, form]);

  const handleWorkflowStepsUpdated = (steps: WorkflowStep[], updatedWorkflowId: string | null) => {
    console.log("Workflow steps updated:", steps, "workflow ID:", updatedWorkflowId);
    setSavedWorkflowSteps(steps);
    if (updatedWorkflowId) {
      setWorkflowId(updatedWorkflowId);
    }
  };

  const saveRequestType = async (values: RequestTypeFormValues) => {
    try {
      if (isEditing && requestType) {
        const { data, error } = await supabase
          .from("request_types")
          .update({
            name: values.name,
            description: values.description || null,
            is_active: values.is_active,
            form_schema: values.form_schema,
          })
          .eq("id", requestType.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase
          .from("request_types")
          .insert([
            {
              name: values.name,
              description: values.description || null,
              is_active: values.is_active,
              form_schema: values.form_schema,
            },
          ])
          .select();

        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error("Error saving request type:", error);
      throw error;
    }
  };

  const createOrUpdateWorkflow = async (requestTypeId: string) => {
    try {
      if (workflowId) {
        const { data, error } = await supabase
          .from("request_workflows")
          .update({
            name: `سير عمل ${form.getValues("name")}`,
            description: `سير عمل تلقائي لنوع الطلب: ${form.getValues("name")}`,
            is_active: true,
          })
          .eq("id", workflowId)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase
          .from("request_workflows")
          .insert([
            {
              name: `سير عمل ${form.getValues("name")}`,
              description: `سير عمل تلقائي لنوع الطلب: ${form.getValues("name")}`,
              request_type_id: requestTypeId,
              is_active: true,
            },
          ])
          .select();

        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error("Error creating/updating workflow:", error);
      throw error;
    }
  };

  const updateDefaultWorkflow = async (requestTypeId: string, workflowId: string) => {
    try {
      const { error } = await supabase
        .from("request_types")
        .update({ default_workflow_id: workflowId })
        .eq("id", requestTypeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating default workflow:", error);
      throw error;
    }
  };

  const saveWorkflowSteps = async (steps: WorkflowStep[], workflowId: string) => {
    if (!workflowId || steps.length === 0) return true;
    
    try {
      const { error: deleteError } = await supabase
        .from("workflow_steps")
        .delete()
        .eq("workflow_id", workflowId);

      if (deleteError) throw deleteError;

      const stepsToInsert = steps.map(step => ({
        workflow_id: workflowId,
        step_order: step.step_order,
        step_name: step.step_name,
        step_type: step.step_type,
        approver_type: step.approver_type,
        approver_id: step.approver_id,
        instructions: step.instructions,
        is_required: step.is_required
      }));

      const { error: insertError } = await supabase
        .from("workflow_steps")
        .insert(stepsToInsert);

      if (insertError) throw insertError;
      return true;
    } catch (error) {
      console.error("Error saving workflow steps:", error);
      throw error;
    }
  };

  const onSubmit = async (values: RequestTypeFormValues) => {
    setIsLoading(true);
    try {
      const savedRequestType = await saveRequestType(values);
      const requestTypeId = savedRequestType.id;
      setCreatedRequestTypeId(requestTypeId);

      const workflow = await createOrUpdateWorkflow(requestTypeId);
      const workflowId = workflow.id;
      setWorkflowId(workflowId);

      await updateDefaultWorkflow(requestTypeId, workflowId);
      
      if (savedWorkflowSteps.length > 0) {
        await saveWorkflowSteps(savedWorkflowSteps, workflowId);
      }

      toast.success(isEditing ? "تم تحديث نوع الطلب بنجاح" : "تم إضافة نوع طلب جديد بنجاح");
      onRequestTypeCreated();
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء حفظ نوع الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل نوع الطلب" : "إضافة نوع طلب جديد"}</DialogTitle>
          <DialogDescription>
            قم بإضافة تفاصيل نوع الطلب ونموذج البيانات الخاص به وحدد خطوات سير العمل
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-2">
            <RequestTypeForm 
              form={form} 
              onSubmit={onSubmit} 
              isLoading={isLoading}
              onClose={onClose}
              isEditing={isEditing}
            >
              <FormFieldEditor form={form} />
              
              <WorkflowStepsSection 
                createdRequestTypeId={createdRequestTypeId}
                workflowId={workflowId}
                onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
              />
            </RequestTypeForm>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
