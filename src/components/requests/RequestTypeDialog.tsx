
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

  // Load existing request type data when editing
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

  // Handle when workflow steps are updated
  const handleWorkflowStepsUpdated = (steps: WorkflowStep[]) => {
    console.log("Workflow steps updated:", steps);
    setSavedWorkflowSteps(steps);
  };

  // Save request type to database
  const saveRequestType = async (values: RequestTypeFormValues) => {
    values.form_schema = { fields: formFields };

    try {
      if (isEditing && requestType) {
        // Update existing request type
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
        // Create new request type
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

  // Create or update workflow
  const createOrUpdateWorkflow = async (requestTypeId: string) => {
    try {
      if (workflowId) {
        // Update existing workflow
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
        // Create new workflow
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

  // Update request type with default workflow ID
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

  // Save workflow steps to the database
  const saveWorkflowSteps = async (steps: WorkflowStep[], workflowId: string) => {
    if (!workflowId || steps.length === 0) return true;
    
    try {
      // First delete any existing steps
      const { error: deleteError } = await supabase
        .from("workflow_steps")
        .delete()
        .eq("workflow_id", workflowId);

      if (deleteError) throw deleteError;

      // Then insert the new steps
      const stepsToInsert = steps.map((step, index) => ({
        workflow_id: workflowId,
        step_order: index + 1,
        step_name: step.step_name,
        step_type: step.step_type || 'opinion',
        approver_type: step.approver_type || 'user',
        approver_id: step.approver_id,
        instructions: step.instructions,
        is_required: step.is_required !== false
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
    if (formFields.length === 0) {
      toast.error("يجب إضافة حقل واحد على الأقل للنموذج");
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Save the request type
      const requestTypeResult = await saveRequestType(values);
      const requestTypeId = requestTypeResult.id;
      setCreatedRequestTypeId(requestTypeId);
      
      // Step 2: Create/update workflow if we have steps or are editing an existing one
      let workflowResult = null;
      let newWorkflowId = null;
      
      if (savedWorkflowSteps.length > 0 || workflowId) {
        setIsWorkflowSaving(true);
        
        // Create or update the workflow
        workflowResult = await createOrUpdateWorkflow(requestTypeId);
        
        if (workflowResult) {
          newWorkflowId = workflowResult.id;
          
          // Update the state with the new workflow ID
          setWorkflowId(newWorkflowId);
          
          // Save workflow steps
          await saveWorkflowSteps(savedWorkflowSteps, newWorkflowId);
          
          // Update the request type with the default workflow ID if needed
          if (!workflowId || workflowId !== newWorkflowId) {
            await updateDefaultWorkflow(requestTypeId, newWorkflowId);
          }
        }
        
        setIsWorkflowSaving(false);
      }

      toast.success(isEditing ? "تم تحديث نوع الطلب بنجاح" : "تم إنشاء نوع الطلب بنجاح");
      onRequestTypeCreated();
      onClose();
    } catch (error) {
      console.error("Error in submission process:", error);
      toast.error(isEditing ? "حدث خطأ أثناء تحديث نوع الطلب" : "حدث خطأ أثناء إنشاء نوع الطلب");
    } finally {
      setIsLoading(false);
      setIsWorkflowSaving(false);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: "نص",
      textarea: "نص طويل",
      number: "رقم",
      date: "تاريخ",
      select: "قائمة اختيار",
      file: "ملف مرفق",
      array: "قائمة عناصر"
    };
    return types[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rtl max-h-[95vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل نوع الطلب" : "إضافة نوع طلب جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "عدّل بيانات نوع الطلب وحقول النموذج وخطوات سير العمل" : "أنشئ نوع طلب جديد وحدد حقول النموذج المطلوبة وخطوات سير العمل"}
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
                      <FormLabel>اسم نوع الطلب</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم نوع الطلب" {...field} />
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
                        <FormDescription>
                          تفعيل أو تعطيل نوع الطلب
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصفاً لنوع الطلب (اختياري)"
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
                  {/* Form Fields Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">حقول النموذج</h3>
                    </div>
                    <Separator />

                    <Card>
                      <CardHeader className="pb-3">
                        <h4 className="text-sm font-medium">إضافة حقل جديد</h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">اسم الحقل</label>
                            <Input
                              placeholder="اسم الحقل (بدون مسافات)"
                              value={currentField.name}
                              onChange={(e) =>
                                setCurrentField({ ...currentField, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">عنوان الحقل</label>
                            <Input
                              placeholder="العنوان الظاهر للمستخدم"
                              value={currentField.label}
                              onChange={(e) =>
                                setCurrentField({ ...currentField, label: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">نوع الحقل</label>
                            <Select
                              value={currentField.type}
                              onValueChange={(value: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'array' | 'file') =>
                                setCurrentField({ ...currentField, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الحقل" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">نص</SelectItem>
                                <SelectItem value="textarea">نص طويل</SelectItem>
                                <SelectItem value="number">رقم</SelectItem>
                                <SelectItem value="date">تاريخ</SelectItem>
                                <SelectItem value="select">قائمة اختيار</SelectItem>
                                <SelectItem value="file">ملف مرفق</SelectItem>
                                <SelectItem value="array">قائمة عناصر</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Switch
                                id="required-field"
                                checked={currentField.required}
                                onCheckedChange={(checked) =>
                                  setCurrentField({ ...currentField, required: checked })
                                }
                              />
                              <label
                                htmlFor="required-field"
                                className="text-sm font-medium"
                              >
                                حقل مطلوب
                              </label>
                            </div>
                          </div>
                        </div>

                        {currentField.type === "select" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">خيارات القائمة</label>
                            <div className="flex space-x-2 space-x-reverse">
                              <Input
                                placeholder="أدخل خياراً"
                                value={currentOption}
                                onChange={(e) => setCurrentOption(e.target.value)}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleAddOption}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1 pt-2">
                              {(currentField.options || []).map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-muted p-2 rounded-md"
                                >
                                  <span>{option}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveOption(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          type="button"
                          onClick={handleAddField}
                          className="mr-auto"
                        >
                          {editingFieldIndex !== null ? "تحديث الحقل" : "إضافة الحقل"}
                        </Button>
                      </CardFooter>
                    </Card>

                    {formFields.length > 0 && (
                      <div className="border rounded-md p-4 space-y-3">
                        <h4 className="text-sm font-medium">حقول النموذج</h4>
                        <div className="space-y-2">
                          {formFields.map((field, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-muted p-3 rounded-md"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{field.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {field.name} - {getFieldTypeLabel(field.type)}
                                  {field.required && " (مطلوب)"}
                                </div>
                              </div>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditField(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500"
                                  onClick={() => handleRemoveField(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workflow Steps Section */}
                  <WorkflowStepsConfig 
                    requestTypeId={createdRequestTypeId}
                    workflowId={workflowId}
                    onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
                  />
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="mt-4 flex-row-reverse sm:justify-start">
              <Button type="submit" disabled={isLoading || isWorkflowSaving}>
                {isLoading || isWorkflowSaving
                  ? (isEditing ? "جارٍ التحديث..." : "جارٍ الإنشاء...") 
                  : (isEditing ? "تحديث نوع الطلب" : "إنشاء نوع الطلب")
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
