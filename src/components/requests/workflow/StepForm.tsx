
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowStep, User } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface StepFormProps {
  currentStep: WorkflowStep;
  editingStepIndex: number | null;
  users: User[];
  isLoading: boolean;
  onStepChange: (step: WorkflowStep) => void;
  onAddStep: () => void;
}

export const StepForm = ({
  currentStep,
  editingStepIndex,
  users,
  isLoading,
  onStepChange,
  onAddStep,
}: StepFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h4 className="text-sm font-medium">
          {editingStepIndex !== null
            ? "تعديل خطوة سير العمل"
            : "إضافة خطوة جديدة"}
        </h4>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم الخطوة</label>
            <Input
              placeholder="اسم الخطوة"
              value={currentStep.step_name}
              onChange={(e) =>
                onStepChange({ ...currentStep, step_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع الخطوة</label>
            <Select
              value={currentStep.step_type}
              onValueChange={(value: string) =>
                onStepChange({ ...currentStep, step_type: value })
              }
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
          <label className="text-sm font-medium">المسؤول عن الاعتماد</label>
          <Select
            value={currentStep.approver_id || ""}
            onValueChange={(value: string) =>
              onStepChange({ ...currentStep, approver_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المسؤول عن الاعتماد" />
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
          <label className="text-sm font-medium">نوع المعتمد</label>
          <Select
            value={currentStep.approver_type || "user"}
            onValueChange={(value: string) =>
              onStepChange({ ...currentStep, approver_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المعتمد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">مستخدم</SelectItem>
              <SelectItem value="role">دور وظيفي</SelectItem>
              <SelectItem value="department">إدارة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">تعليمات</label>
          <Textarea
            placeholder="تعليمات إضافية للمعتمد (اختياري)"
            value={currentStep.instructions || ""}
            onChange={(e) =>
              onStepChange({ ...currentStep, instructions: e.target.value })
            }
          />
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            checked={currentStep.is_required}
            onCheckedChange={(checked) =>
              onStepChange({ ...currentStep, is_required: checked })
            }
          />
          <label className="text-sm font-medium">خطوة إلزامية</label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={onAddStep}
          disabled={isLoading || !currentStep.step_name || !currentStep.approver_id}
          className="mr-auto"
        >
          {isLoading
            ? "جارٍ الحفظ..."
            : editingStepIndex !== null
            ? "تحديث الخطوة"
            : "إضافة الخطوة"}
        </Button>
      </CardFooter>
    </Card>
  );
};
