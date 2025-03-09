
import React from "react";
import { WorkflowStep, User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StepFormProps {
  currentStep: WorkflowStep;
  editingStepIndex: number | null;
  users: User[];
  isLoading: boolean;
  onStepChange: (step: WorkflowStep) => void;
  onAddStep: () => void;
}

export const StepForm: React.FC<StepFormProps> = ({
  currentStep,
  editingStepIndex,
  users,
  isLoading,
  onStepChange,
  onAddStep,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onStepChange({
      ...currentStep,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    onStepChange({
      ...currentStep,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onStepChange({
      ...currentStep,
      [name]: checked,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="step_name">اسم الخطوة</Label>
          <Input
            id="step_name"
            name="step_name"
            value={currentStep.step_name || ''}
            onChange={handleInputChange}
            placeholder="أدخل اسم الخطوة"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="step_type">نوع الخطوة</Label>
          <Select
            value={currentStep.step_type || 'opinion'}
            onValueChange={(value) => handleSelectChange("step_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الخطوة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opinion">رأي</SelectItem>
              <SelectItem value="decision">قرار</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approver_id">المسؤول عن الاعتماد</Label>
        <Select
          value={currentStep.approver_id || ""}
          onValueChange={(value) => handleSelectChange("approver_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر المسؤول" />
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
        <Label htmlFor="instructions">التعليمات</Label>
        <Textarea
          id="instructions"
          name="instructions"
          value={currentStep.instructions || ""}
          onChange={handleInputChange}
          placeholder="أدخل تعليمات للمسؤول عن الاعتماد"
        />
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox
          id="is_required"
          checked={currentStep.is_required !== false}
          onCheckedChange={(checked) =>
            handleCheckboxChange("is_required", checked as boolean)
          }
        />
        <Label htmlFor="is_required">إلزامي</Label>
      </div>

      <Button
        type="button"
        disabled={isLoading}
        onClick={onAddStep}
        className="w-full"
      >
        {isLoading
          ? "جار الحفظ..."
          : editingStepIndex !== null
          ? "تحديث الخطوة"
          : "إضافة الخطوة"}
      </Button>
    </div>
  );
};
