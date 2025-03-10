
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  onStepChange: (step: WorkflowStep) => void;
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
  const handleInputChange = (field: string, value: any) => {
    console.log(`[StepForm] Changing field ${field} to:`, value);
    onStepChange({
      ...currentStep,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="text-sm font-medium">
        {editingStepIndex !== null ? "تعديل الخطوة" : "إضافة خطوة جديدة"}
      </h4>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">اسم الخطوة</label>
          <Input
            value={currentStep.step_name || ''}
            onChange={(e) => handleInputChange('step_name', e.target.value)}
            placeholder="أدخل اسم الخطوة"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">نوع الخطوة</label>
          <Select
            value={currentStep.step_type || 'opinion'}
            onValueChange={(value) => handleInputChange('step_type', value)}
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
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">المعتمد</label>
          <Select
            value={currentStep.approver_id || ''}
            onValueChange={(value) => {
              console.log("[StepForm] Selected approver ID:", value);
              handleInputChange('approver_id', value);
              // Also set approver_type to 'user' when an approver is selected
              handleInputChange('approver_type', 'user');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المعتمد" />
            </SelectTrigger>
            <SelectContent>
              {users.length === 0 ? (
                <SelectItem value="" disabled>جاري تحميل قائمة المستخدمين...</SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name || user.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {users.length === 0 && (
            <p className="text-xs text-red-500">لم يتم العثور على مستخدمين</p>
          )}
        </div>
        
        <div className="flex items-end space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is-required"
              checked={currentStep.is_required !== false}
              onCheckedChange={(checked) => handleInputChange('is_required', checked)}
            />
            <label htmlFor="is-required" className="text-sm font-medium">
              إلزامي
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">تعليمات</label>
        <Textarea
          value={currentStep.instructions || ''}
          onChange={(e) => handleInputChange('instructions', e.target.value)}
          placeholder="أدخل تعليمات للمعتمد (اختياري)"
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={onAddStep}
          disabled={isLoading || !currentStep.step_name || !currentStep.approver_id}
        >
          {isLoading 
            ? "جاري الحفظ..." 
            : editingStepIndex !== null 
              ? "تحديث الخطوة" 
              : "إضافة الخطوة"
          }
        </Button>
      </div>
    </div>
  );
};
