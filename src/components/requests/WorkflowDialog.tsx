
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestWorkflow, WorkflowStep } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WorkflowStepsConfig } from "./WorkflowStepsConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const workflowSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

interface WorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowCreated: () => void;
  requestTypeId: string | null;
  workflow?: RequestWorkflow | null;
}

export const WorkflowDialog = ({
  isOpen,
  onClose,
  onWorkflowCreated,
  requestTypeId,
  workflow = null,
}: WorkflowDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const isEditing = !!workflow;

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description || "",
        is_active: workflow.is_active,
      });

      const fetchWorkflowSteps = async () => {
        const { data, error } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("workflow_id", workflow.id)
          .order("step_order", { ascending: true });
        
        if (error) {
          console.error("Error fetching workflow steps:", error);
          return;
        }
        
        setWorkflowSteps(data || []);
      };
      
      fetchWorkflowSteps();
    } else {
      form.reset({
        name: "",
        description: "",
        is_active: true,
      });
      setWorkflowSteps([]);
    }
  }, [workflow, form]);

  const handleWorkflowStepsUpdated = (steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
  };

  const saveWorkflow = async (values: WorkflowFormValues) => {
    if (isEditing && workflow) {
      // Update existing workflow
      const { data, error } = await supabase
        .from("request_workflows")
        .update({
          name: values.name,
          description: values.description || null,
          is_active: values.is_active,
        })
        .eq("id", workflow.id)
        .select();

      if (error) throw error;
      return data[0];
    } else {
      // Create new workflow
      const { data, error } = await supabase
        .from("request_workflows")
        .insert([
          {
            name: values.name,
            description: values.description || null,
            is_active: values.is_active,
            request_type_id: requestTypeId,
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    }
  };

  const saveWorkflowSteps = async (workflowId: string) => {
    if (workflowSteps.length === 0) return;

    // If editing, first delete existing steps
    if (isEditing && workflow) {
      const { error: deleteError } = await supabase
        .from("workflow_steps")
        .delete()
        .eq("workflow_id", workflow.id);

      if (deleteError) throw deleteError;
    }

    const stepsToInsert = workflowSteps.map((step, index) => ({
      workflow_id: workflowId,
      step_order: index + 1,
      step_name: step.step_name,
      step_type: step.step_type,
      approver_id: step.approver_id,
      instructions: step.instructions || "",
      is_required: step.is_required,
      approver_type: step.approver_type || 'user'
    }));

    const { error } = await supabase
      .from("workflow_steps")
      .insert(stepsToInsert);

    if (error) throw error;
  };

  const onSubmit = async (values: WorkflowFormValues) => {
    if (workflowSteps.length === 0) {
      toast.error("يجب إضافة خطوة واحدة على الأقل لسير العمل");
      return;
    }

    setIsLoading(true);
    try {
      const workflowResult = await saveWorkflow(values);
      await saveWorkflowSteps(workflowResult.id);

      toast.success(isEditing ? "تم تحديث سير العمل بنجاح" : "تم إنشاء سير العمل بنجاح");
      onWorkflowCreated();
      onClose();
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error(isEditing ? "حدث خطأ أثناء تحديث سير العمل" : "حدث خطأ أثناء إنشاء سير العمل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rtl max-h-[95vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل سير العمل" : "إضافة سير عمل جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "عدّل بيانات سير العمل وخطوات سير العمل" : "أنشئ سير عمل جديد وحدد خطوات سير العمل المطلوبة"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم سير العمل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم سير العمل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-[72px]">
                      <div className="space-y-0.5">
                        <FormLabel>نشط</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصفاً لسير العمل (اختياري)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex-1 overflow-hidden space-y-6">
              <ScrollArea className="h-[calc(65vh-220px)]">
                <div className="px-1 space-y-8">
                  <WorkflowStepsConfig 
                    requestTypeId={workflow ? workflow.id : requestTypeId}
                    onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
                  />
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="mt-4 flex-row-reverse sm:justify-start">
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (isEditing ? "جارٍ التحديث..." : "جارٍ الإنشاء...") 
                  : (isEditing ? "تحديث سير العمل" : "إنشاء سير العمل")
                }
              </Button>
              <Button variant="outline" type="button" onClick={onClose}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
