
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { FormSchema, FormField as FormFieldType, RequestType, WorkflowStep } from "./types";
import { WorkflowStepsConfig } from "./WorkflowStepsConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const requestTypeSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  form_schema: z.object({
    fields: z.array(
      z.object({
        name: z.string().min(1, { message: "اسم الحقل مطلوب" }),
        label: z.string().min(1, { message: "عنوان الحقل مطلوب" }),
        type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'array', 'file']),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
      })
    ),
  }).default({ fields: [] }),
});

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
  const [formFields, setFormFields] = useState<FormFieldType[]>([]);
  const [currentField, setCurrentField] = useState<FormFieldType>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentOption, setCurrentOption] = useState("");
  const [createdRequestTypeId, setCreatedRequestTypeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [savedWorkflowSteps, setSavedWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const isEditing = !!requestType;
  const [isWorkflowSaving, setIsWorkflowSaving] = useState(false);

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

  useEffect(() => {
    if (requestType) {
      form.reset({
        name: requestType.name,
        description: requestType.description || "",
        is_active: requestType.is_active,
        form_schema: requestType.form_schema,
      });
      setFormFields(requestType.form_schema.fields || []);
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
      setFormFields([]);
      setCreatedRequestTypeId(null);
      setWorkflowId(null);
      setSavedWorkflowSteps([]);
    }
  }, [requestType, form]);

  const resetFieldForm = () => {
    setCurrentField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setEditingFieldIndex(null);
    setCurrentOption("");
  };

  const handleAddField = () => {
    if (!currentField.name || !currentField.label) {
      toast.error("اسم الحقل وعنوانه مطلوبان");
      return;
    }

    const formattedName = currentField.name.replace(/\s+/g, "_").toLowerCase();
    
    const newField: FormFieldType = {
      ...currentField,
      name: formattedName,
    };

    const updatedFields = [...formFields];

    if (editingFieldIndex !== null) {
      updatedFields[editingFieldIndex] = newField;
    } else {
      updatedFields.push(newField);
    }

    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
    resetFieldForm();
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
  };

  const handleEditField = (index: number) => {
    setCurrentField(formFields[index]);
    setEditingFieldIndex(index);
  };

  const handleAddOption = () => {
    if (!currentOption) return;
    
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: [...options, currentOption],
    });
    setCurrentOption("");
  };

  const handleRemoveOption = (index: number) => {
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: options.filter((_, i) => i !== index),
    });
  };

  const handleWorkflowStepsUpdated = (steps: WorkflowStep[], updatedWorkflowId: string | null) => {
    console.log("Workflow steps updated:", steps, "workflow ID:", updatedWorkflowId);
    setSavedWorkflowSteps(steps);
    if (updatedWorkflowId) {
      setWorkflowId(updatedWorkflowId);
    }
  };

  const saveRequestType = async (values: RequestTypeFormValues) => {
    values.form_schema = { fields: formFields };

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
        resetFieldForm();
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم نوع الطلب</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: طلب إجازة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف نوع الطلب</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف مختصر لنوع الطلب وغرضه"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">نشط</FormLabel>
                          <FormDescription>
                            تحديد ما إذا كان هذا النوع من الطلبات متاحًا للاستخدام
                          </FormDescription>
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

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">نموذج البيانات</h3>
                  <p className="text-sm text-muted-foreground">
                    قم بتحديد الحقول المطلوبة في نموذج الطلب
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="field-name" className="text-sm font-medium">اسم الحقل</label>
                        <Input
                          id="field-name"
                          value={currentField.name}
                          onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                          placeholder="مثال: اسم_المشروع"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="field-label" className="text-sm font-medium">عنوان الحقل</label>
                        <Input
                          id="field-label"
                          value={currentField.label}
                          onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                          placeholder="مثال: اسم المشروع"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="field-type" className="text-sm font-medium">نوع الحقل</label>
                        <Select
                          value={currentField.type}
                          onValueChange={(value: any) => setCurrentField({ ...currentField, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الحقل" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">نص</SelectItem>
                            <SelectItem value="textarea">نص متعدد الأسطر</SelectItem>
                            <SelectItem value="number">رقم</SelectItem>
                            <SelectItem value="date">تاريخ</SelectItem>
                            <SelectItem value="select">قائمة منسدلة</SelectItem>
                            <SelectItem value="file">ملف</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="field-required"
                          checked={currentField.required}
                          onCheckedChange={(checked) => setCurrentField({ ...currentField, required: checked })}
                        />
                        <label htmlFor="field-required" className="text-sm font-medium mr-2">مطلوب</label>
                      </div>

                      {currentField.type === 'select' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">قيم القائمة المنسدلة</label>
                          
                          <div className="flex space-x-2">
                            <Input
                              value={currentOption}
                              onChange={(e) => setCurrentOption(e.target.value)}
                              placeholder="أضف قيمة جديدة"
                              className="flex-1 ml-2"
                            />
                            <Button type="button" size="sm" onClick={handleAddOption}>إضافة</Button>
                          </div>

                          <div className="space-y-2 mt-2">
                            {currentField.options && currentField.options.map((option, i) => (
                              <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span>{option}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveOption(i)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          onClick={handleAddField}
                        >
                          {editingFieldIndex !== null ? 'تحديث الحقل' : 'إضافة حقل'}
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">الحقول المضافة</h4>
                      {formFields.length === 0 ? (
                        <p className="text-sm text-muted-foreground">لم يتم إضافة أي حقول بعد</p>
                      ) : (
                        <div className="space-y-2">
                          {formFields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                              <div>
                                <span className="font-medium">{field.label}</span>
                                <span className="mx-2 text-muted-foreground">({field.name})</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{field.type}</span>
                                {field.required && (
                                  <span className="text-xs bg-red-100 text-red-800 mx-1 px-2 py-0.5 rounded">مطلوب</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditField(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveField(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {createdRequestTypeId && (
                  <WorkflowStepsConfig 
                    requestTypeId={createdRequestTypeId}
                    workflowId={workflowId}
                    onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
                  />
                )}

                {!createdRequestTypeId && (
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <p className="text-muted-foreground">يمكنك إضافة خطوات سير العمل بعد حفظ نوع الطلب أولاً</p>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "جاري الحفظ..." : isEditing ? "تحديث" : "إضافة"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
