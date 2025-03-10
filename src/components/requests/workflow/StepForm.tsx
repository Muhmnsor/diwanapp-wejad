
import React from "react";
import { WorkflowStep, User } from "../types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const handleInputChange = (field: keyof WorkflowStep, value: any) => {
    onStepChange({
      ...currentStep,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting step form with:", currentStep);
    onAddStep();
  };

  if (!currentStep) {
    console.warn("StepForm received null currentStep");
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingStepIndex !== null ? "تعديل الخطوة" : "إضافة خطوة جديدة"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="step-name" className="font-medium">
                اسم الخطوة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="step-name"
                placeholder="أدخل اسم الخطوة"
                value={currentStep.step_name || ""}
                onChange={(e) => handleInputChange("step_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step-type" className="font-medium">
                نوع الخطوة
              </Label>
              <Select
                value={currentStep.step_type || "decision"}
                onValueChange={(value) => handleInputChange("step_type", value)}
              >
                <SelectTrigger id="step-type">
                  <SelectValue placeholder="اختر نوع الخطوة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decision">قرار</SelectItem>
                  <SelectItem value="opinion">رأي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approver" className="font-medium">
                المعتمد <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentStep.approver_id || ""}
                onValueChange={(value) => handleInputChange("approver_id", value)}
                required
              >
                <SelectTrigger id="approver">
                  <SelectValue placeholder="اختر المعتمد" />
                </SelectTrigger>
                <SelectContent>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name || user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      لا يوجد مستخدمين متاحين
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-required" className="font-medium">
                  إلزامية الخطوة
                </Label>
                <Switch
                  id="is-required"
                  checked={currentStep.is_required !== false}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_required", checked)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                يتطلب اتخاذ القرار لإكمال سير العمل
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="font-medium">
              التعليمات (اختياري)
            </Label>
            <Textarea
              id="instructions"
              placeholder="أدخل تعليمات للمعتمد"
              value={currentStep.instructions || ""}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            className="mr-auto"
            disabled={isLoading || !currentStep.step_name || !currentStep.approver_id}
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري المعالجة...
              </span>
            ) : (
              editingStepIndex !== null ? "تحديث الخطوة" : "إضافة الخطوة"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
