
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowStep, User } from "../types";

interface StepFormProps {
  currentStep: WorkflowStep;
  editingStepIndex: number | null;
  users: User[];
  isLoading: boolean;
  onStepChange: (updatedStep: WorkflowStep) => void;
  onAddStep: () => void;
}

export const StepForm = ({ 
  currentStep, 
  editingStepIndex, 
  users, 
  isLoading,
  onStepChange,
  onAddStep
}: StepFormProps) => {
  return (
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
                onStepChange({ ...currentStep, step_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">نوع الخطوة</label>
            <RadioGroup
              value={currentStep.step_type}
              onValueChange={(value: 'opinion' | 'decision') =>
                onStepChange({ ...currentStep, step_type: value })
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
                onStepChange({ ...currentStep, approver_id: value })
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
                onStepChange({ ...currentStep, instructions: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="required-step"
              checked={currentStep.is_required}
              onCheckedChange={(checked) =>
                onStepChange({ ...currentStep, is_required: checked })
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
          onClick={onAddStep}
          className="ms-auto"
          disabled={isLoading}
        >
          {editingStepIndex !== null ? "تحديث الخطوة" : "إضافة الخطوة"}
        </Button>
      </CardFooter>
    </Card>
  );
};
