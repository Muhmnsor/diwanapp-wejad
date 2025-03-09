
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, X, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface WorkflowStep {
  id?: string;
  step_order: number;
  step_name: string;
  step_type: 'opinion' | 'decision';
  approver_id: string | null;
  instructions: string | null;
  is_required: boolean;
}

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
}

interface User {
  id: string;
  display_name: string | null;
  email: string | null;
}

export const WorkflowStepsConfig = ({ 
  requestTypeId, 
  onWorkflowStepsUpdated 
}: WorkflowStepsConfigProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>({
    step_order: 0,
    step_name: "",
    step_type: "opinion",
    approver_id: null,
    instructions: "",
    is_required: true,
  });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users on component mount
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
  }, [requestTypeId]);

  const resetStepForm = () => {
    setCurrentStep({
      step_order: workflowSteps.length, // Set to the next order
      step_name: "",
      step_type: "opinion",
      approver_id: null,
      instructions: "",
      is_required: true,
    });
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

  // Helper function to get approver name by id
  const getApproverName = (step: WorkflowStep) => {
    if (!step.approver_id) return "غير محدد";
    
    const user = users.find(u => u.id === step.approver_id);
    return user ? (user.display_name || user.email) : "غير محدد";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">إعداد خطوات سير العمل</h3>
      <Card>
        <CardHeader className="pb-3">
          <h4 className="text-sm font-medium">{editingStepIndex !== null ? "تعديل خطوة" : "إضافة خطوة جديدة"}</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم الخطوة</label>
              <Input
                placeholder="أدخل اسم الخطوة"
                value={currentStep.step_name}
                onChange={(e) =>
                  setCurrentStep({ ...currentStep, step_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">نوع الخطوة</label>
              <RadioGroup
                value={currentStep.step_type}
                onValueChange={(value: 'opinion' | 'decision') =>
                  setCurrentStep({ ...currentStep, step_type: value })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="opinion" id="step-type-opinion" />
                  <Label htmlFor="step-type-opinion">رأي</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="decision" id="step-type-decision" />
                  <Label htmlFor="step-type-decision">قرار</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المعتمد</label>
              <Select
                value={currentStep.approver_id || ""}
                onValueChange={(value) =>
                  setCurrentStep({ ...currentStep, approver_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المعتمد" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تعليمات</label>
              <Textarea
                placeholder="أدخل تعليمات للمعتمد (اختياري)"
                value={currentStep.instructions || ""}
                onChange={(e) =>
                  setCurrentStep({ ...currentStep, instructions: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="required-step"
                checked={currentStep.is_required}
                onCheckedChange={(checked) =>
                  setCurrentStep({ ...currentStep, is_required: checked })
                }
              />
              <label htmlFor="required-step" className="text-sm font-medium">
                خطوة إلزامية
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={handleAddStep}
            className="ms-auto"
          >
            {editingStepIndex !== null ? "تحديث الخطوة" : "إضافة الخطوة"}
          </Button>
        </CardFooter>
      </Card>

      {workflowSteps.length > 0 && (
        <div className="border rounded-md p-4 space-y-3">
          <h4 className="text-sm font-medium">خطوات سير العمل</h4>
          <div className="space-y-2">
            {workflowSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted p-3 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium">{step.step_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {step.step_type === 'opinion' ? 'رأي' : 'قرار'} - 
                    المعتمد: {getApproverName(step)}
                    {step.is_required ? " (إلزامي)" : " (اختياري)"}
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveStep(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveStep(index, 'down')}
                    disabled={index === workflowSteps.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStep(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleRemoveStep(index)}
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
  );
};
