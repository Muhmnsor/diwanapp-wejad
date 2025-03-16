
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowStep, User } from "../types";
import { v4 as uuidv4 } from "uuid";

export interface StepFormProps {
  step: WorkflowStep;
  editingIndex: number | null;
  users: User[];
  isLoading?: boolean;
  onUpdateStep: (step: WorkflowStep) => void;
  onSaveStep: () => void;
}

export const StepForm: React.FC<StepFormProps> = ({
  step,
  editingIndex,
  users,
  isLoading = false,
  onUpdateStep,
  onSaveStep,
}) => {
  const handleStepTypeChange = (value: "decision" | "opinion" | "notification") => {
    onUpdateStep({
      ...step,
      step_type: value,
    });
  };

  const handleApproverChange = (value: string) => {
    const selectedUser = users.find(user => user.id === value);
    onUpdateStep({
      ...step,
      approver_id: value,
      approver_name: selectedUser?.display_name || null,
    });
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdateStep({
      ...step,
      is_required: checked,
    });
  };

  const isValid = () => {
    return !!step.step_name && !!step.approver_id;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingIndex !== null ? "تعديل خطوة" : "إضافة خطوة جديدة"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="step-name">اسم الخطوة</Label>
            <Input
              id="step-name"
              placeholder="أدخل اسماً للخطوة"
              value={step.step_name || ""}
              onChange={(e) => onUpdateStep({ ...step, step_name: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="step-type">نوع الخطوة</Label>
            <Select
              value={step.step_type}
              onValueChange={handleStepTypeChange}
            >
              <SelectTrigger id="step-type">
                <SelectValue placeholder="اختر نوع الخطوة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decision">موافقة / رفض</SelectItem>
                <SelectItem value="opinion">إبداء رأي</SelectItem>
                <SelectItem value="notification">إخطار فقط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="approver">المسؤول</Label>
            <Select
              value={step.approver_id || ""}
              onValueChange={handleApproverChange}
            >
              <SelectTrigger id="approver">
                <SelectValue placeholder="اختر المسؤول عن الخطوة" />
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
          
          <div className="flex items-center pt-8">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="is-required"
                checked={step.is_required}
                onCheckedChange={handleRequiredChange}
              />
              <Label htmlFor="is-required">خطوة إلزامية</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instructions">تعليمات (اختياري)</Label>
          <Textarea
            id="instructions"
            placeholder="تعليمات أو ملاحظات إضافية للخطوة"
            value={step.instructions || ""}
            onChange={(e) => onUpdateStep({ ...step, instructions: e.target.value })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSaveStep}
          disabled={!isValid() || isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? "جارٍ الحفظ..." : editingIndex !== null ? "تحديث الخطوة" : "إضافة الخطوة"}
        </Button>
      </CardFooter>
    </Card>
  );
};
