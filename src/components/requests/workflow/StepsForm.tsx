
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
    // Log step input changes for debugging
    console.log(`Step form field changed: ${field}`, value);
    
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
            value={currentStep.step_type || 'decision'}
            onValueChange={(value) => handleInputChange('step_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الخطوة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decision">قرار</SelectItem>
              <SelectItem value="opinion">رأي</SelectItem>
              <SelectItem value="notification">إشعار</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">المعتمد</label>
          <Select
            value={currentStep.approver_id || ''}
            onValueChange={(value) => handleInputChange('approver_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المعتمد" />
            </SelectTrigger>
            <SelectContent>
              {users.length === 0 ? (
                <SelectItem value="" disabled>لا يوجد مستخدمين متاحين</SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name || user.email || user.id}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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
      
      {/* Debug info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-2 border border-gray-200 rounded bg-gray-50 text-xs">
          <details>
            <summary className="cursor-pointer">Step Debug Info</summary>
            <pre className="mt-2 overflow-auto max-h-40">
              {JSON.stringify(currentStep, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
