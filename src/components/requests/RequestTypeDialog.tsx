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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Move, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { FormSchema, FormField as FormFieldType } from "./types";
import { WorkflowStepsConfig } from "./WorkflowStepsConfig";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export const RequestTypeDialog = ({
  isOpen,
  onClose,
  onRequestTypeCreated,
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
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [activeTab, setActiveTab] = useState("form-fields");
  const [createdRequestTypeId, setCreatedRequestTypeId] = useState<string | null>(null);

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

  const handleWorkflowStepsUpdated = (steps) => {
    setWorkflowSteps(steps);
  };

  const saveRequestType = async (values: RequestTypeFormValues) => {
    values.form_schema = { fields: formFields };

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
  };

  const createWorkflow = async (requestTypeId: string) => {
    if (workflowSteps.length === 0) return null;

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
  };

  const saveWorkflowSteps = async (workflowId: string) => {
    if (workflowSteps.length === 0) return;

    const stepsToInsert = workflowSteps.map(step => ({
      workflow_id: workflowId,
      step_order: step.step_order,
      step_name: step.step_name,
      step_type: step.step_type,
      approver_id: step.approver_id,
      instructions: step.instructions,
      is_required: step.is_required
    }));

    const { error } = await supabase
      .from("workflow_steps")
      .insert(stepsToInsert);

    if (error) throw error;
  };

  const updateDefaultWorkflow = async (requestTypeId: string, workflowId: string) => {
    const { error } = await supabase
      .from("request_types")
      .update({ default_workflow_id: workflowId })
      .eq("id", requestTypeId);

    if (error) throw error;
  };

  const onSubmit = async (values: RequestTypeFormValues) => {
    if (formFields.length === 0) {
      toast.error("يجب إضافة حقل واحد على الأقل للنموذج");
      return;
    }

    setIsLoading(true);
    try {
      const requestType = await saveRequestType(values);
      setCreatedRequestTypeId(requestType.id);
      
      if (workflowSteps.length > 0) {
        const workflow = await createWorkflow(requestType.id);
        
        if (workflow) {
          await saveWorkflowSteps(workflow.id);
          
          await updateDefaultWorkflow(requestType.id, workflow.id);
        }
      }

      toast.success("تم إنشاء نوع الطلب بنجاح");
      onRequestTypeCreated();
      onClose();
    } catch (error) {
      console.error("Error creating request type:", error);
      toast.error("حدث خطأ أثناء إنشاء نوع الطلب");
    } finally {
      setIsLoading(false);
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
          <DialogTitle>إضافة نوع طلب جديد</DialogTitle>
          <DialogDescription>
            أنشئ نوع طلب جديد وحدد حقول النموذج المطلوبة وخطوات سير العمل
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form-fields">حقول النموذج</TabsTrigger>
                <TabsTrigger value="workflow">خطوات سير العمل</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[calc(65vh-220px)]">
                  <TabsContent value="form-fields" className="mt-0 px-1">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">إدارة حقول النموذج</h3>
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
                  </TabsContent>

                  <TabsContent value="workflow" className="mt-0 px-1">
                    <WorkflowStepsConfig 
                      requestTypeId={createdRequestTypeId}
                      onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
                    />
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>

            <DialogFooter className="mt-4 flex-row-reverse sm:justify-start">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جارٍ الإنشاء..." : "إنشاء نوع الطلب"}
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
