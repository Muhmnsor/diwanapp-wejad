
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WorkflowStep, User } from '../types';
import { PlusCircle, Save } from 'lucide-react';

interface StepFormProps {
  currentStep: WorkflowStep;
  setCurrentStep: (step: WorkflowStep) => void;
  onAddStep: () => void;
  editingStepIndex: number | null;
  users: User[];
  isLoading?: boolean;
}

export const StepForm: React.FC<StepFormProps> = ({
  currentStep,
  setCurrentStep,
  onAddStep,
  editingStepIndex,
  users,
  isLoading = false
}) => {
  return (
    <Card className="border-dashed border-muted-foreground/50">
      <CardContent className="pt-6 px-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="step_name">اسم الخطوة</Label>
              <Input
                id="step_name"
                placeholder="أدخل اسم الخطوة"
                value={currentStep.step_name}
                onChange={(e) => setCurrentStep({
                  ...currentStep,
                  step_name: e.target.value
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step_type">نوع الخطوة</Label>
              <Select
                value={currentStep.step_type}
                onValueChange={(value: 'decision' | 'opinion' | 'notification') => setCurrentStep({
                  ...currentStep,
                  step_type: value
                })}
              >
                <SelectTrigger id="step_type">
                  <SelectValue placeholder="اختر نوع الخطوة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decision">قرار (يؤثر على مسار الطلب)</SelectItem>
                  <SelectItem value="opinion">رأي (لا يؤثر على مسار الطلب)</SelectItem>
                  <SelectItem value="notification">إشعار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approver_id">المسؤول عن الموافقة</Label>
            <Select
              value={currentStep.approver_id || ''}
              onValueChange={(value) => setCurrentStep({
                ...currentStep,
                approver_id: value
              })}
            >
              <SelectTrigger id="approver_id">
                <SelectValue placeholder="اختر المسؤول عن الموافقة" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">تعليمات للمعتمد</Label>
            <Textarea
              id="instructions"
              placeholder="تعليمات اختيارية للمعتمد (اختياري)"
              value={currentStep.instructions || ''}
              onChange={(e) => setCurrentStep({
                ...currentStep,
                instructions: e.target.value
              })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="required"
              checked={currentStep.is_required !== false}
              onCheckedChange={(checked) => setCurrentStep({
                ...currentStep,
                is_required: checked
              })}
            />
            <Label htmlFor="required">خطوة إلزامية</Label>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              onClick={onAddStep}
              disabled={isLoading || !currentStep.step_name || !currentStep.approver_id}
              className="w-full"
            >
              {editingStepIndex !== null ? (
                <Save className="h-4 w-4 ml-2" />
              ) : (
                <PlusCircle className="h-4 w-4 ml-2" />
              )}
              {editingStepIndex !== null ? 'حفظ التغييرات' : 'إضافة خطوة'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
