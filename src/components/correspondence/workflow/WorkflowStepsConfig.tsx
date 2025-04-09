import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
  Users,
  User,
} from "lucide-react";

interface WorkflowStep {
  id?: string;
  step_name: string;
  step_type: 'approval' | 'notification' | 'info';
  approver_type: 'user' | 'role' | 'department';
  approver_id?: string;
  instructions?: string;
  is_required: boolean;
  step_order: number;
}

interface WorkflowStepsConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  correspondenceId?: string;
  correspondenceType?: string;
  onWorkflowSaved: (workflowId: string) => void;
}

export const WorkflowStepsConfig: React.FC<WorkflowStepsConfigProps> = ({
  open,
  onOpenChange,
  correspondenceId,
  correspondenceType,
  onWorkflowSaved
}) => {
  const [activeTab, setActiveTab] = useState("define");
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [users, setUsers] = useState<{ id: string; display_name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [existingWorkflows, setExistingWorkflows] = useState<{ id: string; name: string }[]>([]);
  
  // جلب بيانات المستخدمين والأدوار والأقسام والقوالب
  useEffect(() => {
    fetchDropdownOptions();
    if (correspondenceType) {
      fetchExistingWorkflows(correspondenceType);
    }
  }, [correspondenceType]);
  
  const fetchDropdownOptions = async () => {
    try {
      // جلب المستخدمين
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('is_active', true);
      
      if (usersData) {
        setUsers(usersData);
      }
      
      // جلب الأدوار
      const { data: rolesData } = await supabase
        .from('roles')
        .select('id, name');
      
      if (rolesData) {
        setRoles(rolesData);
      }
      
      // جلب الأقسام
      const { data: deptsData } = await supabase
        .from('departments')
        .select('id, name');
      
      if (deptsData) {
        setDepartments(deptsData);
      }
      
      // جلب قوالب سير العمل
      const { data: templatesData } = await supabase
        .from('workflow_templates')
        .select('id, name');
      
      if (templatesData) {
        setTemplates(templatesData);
      }
      
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب بيانات المستخدمين والأدوار والأقسام",
      });
    }
  };
  
  const fetchExistingWorkflows = async (type: string) => {
    try {
      const { data } = await supabase
        .from('workflow_definitions')
        .select('id, name')
        .eq('correspondence_type', type);
      
      if (data) {
        setExistingWorkflows(data);
      }
    } catch (error) {
      console.error("Error fetching existing workflows:", error);
    }
  };
  
  const loadWorkflowTemplate = async (templateId: string) => {
    try {
      const { data } = await supabase
        .from('workflow_templates')
        .select('name, description, steps')
        .eq('id', templateId)
        .single();
      
      if (data) {
        setWorkflowName(data.name);
        setWorkflowDescription(data.description || '');
        
        if (data.steps && Array.isArray(data.steps)) {
          setSteps(data.steps.map((step: WorkflowStep, index: number) => ({
            ...step,
            step_order: index + 1
          })));
        }
        
        toast({
          title: "تم تحميل القالب",
          description: `تم تحميل قالب سير العمل "${data.name}" بنجاح`,
        });
      }
    } catch (error) {
      console.error("Error loading workflow template:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل القالب",
        description: "حدث خطأ أثناء تحميل قالب سير العمل",
      });
    }
  };
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      loadWorkflowTemplate(templateId);
    }
  };
  
  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      step_name: `خطوة ${steps.length + 1}`,
      step_type: 'approval',
      approver_type: 'user',
      is_required: true,
      step_order: steps.length + 1
    };
    
    setSteps([...steps, newStep]);
  };
  
  const handleDeleteStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    
    // إعادة ترتيب الخطوات
    newSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });
    
    setSteps(newSteps);
  };
  
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    
    const newSteps = [...steps];
    const stepToMove = newSteps[index];
    const adjacentIndex = direction === 'up' ? index - 1 : index + 1;
    const adjacentStep = newSteps[adjacentIndex];
    
    // تبديل الخطوات
    newSteps[index] = adjacentStep;
    newSteps[adjacentIndex] = stepToMove;
    
    // إعادة ترتيب الخطوات
    newSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });
    
    setSteps(newSteps);
  };
  
  const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };
  
  const validateWorkflow = () => {
    if (!workflowName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: "يجب إدخال اسم سير العمل",
      });
      return false;
    }
    
    if (steps.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: "يجب إضافة خطوة واحدة على الأقل",
      });
      return false;
    }
    
    // التحقق من تعيين المعتمدين لكل خطوة
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.step_type === 'approval' && !step.approver_id) {
        toast({
          variant: "destructive",
          title: "خطأ في التحقق",
          description: `الخطوة "${step.step_name}" تحتاج إلى تعيين معتمد`,
        });
        return false;
      }
    }
    
    return true;
  };
  
  const saveWorkflow = async () => {
    if (!validateWorkflow()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // حفظ تعريف سير العمل
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_definitions')
        .insert({
          name: workflowName,
          description: workflowDescription,
          correspondence_type: correspondenceType,
          is_active: true
        })
        .select()
        .single();
      
      if (workflowError) throw workflowError;
      
      // حفظ خطوات سير العمل
      const stepsToInsert = steps.map(step => ({
        workflow_id: workflowData.id,
        step_name: step.step_name,
        step_type: step.step_type,
        approver_type: step.approver_type,
        approver_id: step.approver_id,
        instructions: step.instructions,
        is_required: step.is_required,
        step_order: step.step_order
      }));
      
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);
      
      if (stepsError) throw stepsError;
      
      // إذا تم تمرير معرف المعاملة، قم بتعيين سير العمل لها
      if (correspondenceId) {
        const { error: updateError } = await supabase
          .from('correspondence')
          .update({ workflow_id: workflowData.id })
          .eq('id', correspondenceId);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "تم حفظ سير العمل",
        description: "تم حفظ سير العمل وخطواته بنجاح",
      });
      
      // إشعار المكون الأب
      onWorkflowSaved(workflowData.id);
      
      // إغلاق الحوار
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ سير العمل",
        description: "حدث خطأ أثناء حفظ سير العمل وخطواته",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'approval':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'notification':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getApproverTypeIcon = (approverType: string) => {
    switch (approverType) {
      case 'user':
        return <User className="h-4 w-4 text-primary" />;
      case 'role':
      case 'department':
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };
  
  // دالة مساعدة للحصول على اسم المعتمد بناءً على النوع والمعرف
  const getApproverName = (approverType: string, approverId?: string) => {
    if (!approverId) return 'غير محدد';
    
    switch (approverType) {
      case 'user':
        return users.find(u => u.id === approverId)?.display_name || 'غير محدد';
      case 'role':
        return roles.find(r => r.id === approverId)?.name || 'غير محدد';
      case 'department':
        return departments.find(d => d.id === approverId)?.name || 'غير محدد';
      default:
        return 'غير محدد';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>تكوين سير العمل</DialogTitle>
          <DialogDescription>
            قم بإنشاء سير عمل للمعاملة وتحديد خطواته ومسؤولي الاعتماد
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="define">تعريف سير العمل</TabsTrigger>
            <TabsTrigger value="steps">خطوات سير العمل</TabsTrigger>
          </TabsList>
          
          <TabsContent value="define" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="workflow-name">اسم سير العمل</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="أدخل اسماً وصفياً لسير العمل"
                />
              </div>
              
              <div>
                <Label htmlFor="workflow-description">وصف سير العمل</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="أدخل وصفاً مختصراً لسير العمل"
                />
              </div>
              
              <div>
                <Label htmlFor="workflow-template">استخدام قالب</Label>
                <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
                  <SelectTrigger id="workflow-template">
                    <SelectValue placeholder="اختر قالباً لسير العمل (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  يمكنك اختيار قالب لتحميل إعدادات جاهزة لسير العمل
                </p>
              </div>
              
              {existingWorkflows.length > 0 && (
                <div className="border rounded-md p-4 bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">مسارات سير العمل الموجودة لهذا النوع:</h4>
                  <ul className="text-sm space-y-1">
                    {existingWorkflows.map((workflow) => (
                      <li key={workflow.id}>{workflow.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="steps" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">خطوات سير العمل</h3>
              <Button onClick={handleAddStep} variant="outline" size="sm">
                <Plus className="h-4 w-4 ml-1" />
                إضافة خطوة
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">الترتيب</TableHead>
                    <TableHead>اسم الخطوة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المسؤول</TableHead>
                    <TableHead>إلزامية</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.map((step, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex space-x-1 space-x-reverse">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                            {step.step_order}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getStepIcon(step.step_type)}
                          <Input
                            value={step.step_name}
                            onChange={(e) => handleStepChange(index, 'step_name', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={step.step_type}
                          onValueChange={(value) => handleStepChange(index, 'step_type', value as any)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approval">اعتماد</SelectItem>
                            <SelectItem value="notification">إشعار</SelectItem>
                            <SelectItem value="info">معلومات</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={step.approver_type}
                            onValueChange={(value) => handleStepChange(index, 'approver_type', value as any)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">مستخدم محدد</SelectItem>
                              <SelectItem value="role">دور وظيفي</SelectItem>
                              <SelectItem value="department">قسم</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {step.approver_type === 'user' && (
                            <Select
                              value={step.approver_id}
                              onValueChange={(value) => handleStepChange(index, 'approver_id', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="اختر مستخدم" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {step.approver_type === 'role' && (
                            <Select
                              value={step.approver_id}
                              onValueChange={(value) => handleStepChange(index, 'approver_id', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="اختر دور" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          
                          {step.approver_type === 'department' && (
                            <Select
                              value={step.approver_id}
                              onValueChange={(value) => handleStepChange(index, 'approver_id', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="اختر قسم" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={step.is_required}
                          onCheckedChange={(checked) => handleStepChange(index, 'is_required', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Button
                            onClick={() => handleMoveStep(index, 'up')}
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleMoveStep(index, 'down')}
                            variant="ghost"
                            size="icon"
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteStep(index)}
                            variant="ghost"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {steps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لم يتم إضافة أي خطوات بعد. انقر على "إضافة خطوة" لإضافة خطوة جديدة.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {steps.length > 0 && (
              <div className="border rounded-md p-4 bg-muted/20">
                <h4 className="text-sm font-medium mb-2">ملخص سير العمل:</h4>
                <ol className="text-sm space-y-1 mr-4">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-center space-x-2 space-x-reverse">
                      <span className="flex-none">{step.step_order}.</span>
                      <span className="flex-1">{step.step_name}</span>
                      <span>
                        {getApproverTypeIcon(step.approver_type)}
                      </span>
                      <span className="text-muted-foreground">
                        {getApproverName(step.approver_type, step.approver_id)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={saveWorkflow} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ سير العمل
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

