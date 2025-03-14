
import React, { useState } from "react";
import { WorkflowStep, User } from "../types";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Edit, Trash2, AlertCircle } from "lucide-react";
import { getApproverName, getStepTypeLabel, getStepTypeBadgeClass } from "./utils";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface StepsListProps {
  workflowSteps: WorkflowStep[];
  users: User[];
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onEditStep: (index: number) => void;
  onRemoveStep: (index: number) => void;
}

export const StepsList = ({
  workflowSteps,
  users,
  onMoveStep,
  onEditStep,
  onRemoveStep,
}: StepsListProps) => {
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<number | null>(null);

  // Handler for step deletion with confirmation only if it's the last step
  const handleDeleteStep = (index: number) => {
    // If this is the last step, show a confirmation dialog
    if (workflowSteps.length === 1) {
      setStepToDelete(index);
      setShowDeleteDialog(true);
    } else {
      // If not the last step, delete immediately without confirmation
      onRemoveStep(index);
    }
  };

  // Confirm deletion of last step
  const confirmDeleteLastStep = () => {
    if (stepToDelete !== null) {
      onRemoveStep(stepToDelete);
      setStepToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  if (workflowSteps.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted">
        <p className="text-muted-foreground">لم يتم إضافة خطوات لسير العمل بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">الخطوات المضافة</h4>
      <div className="space-y-2">
        {workflowSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-md p-3 bg-card"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                <div className="font-medium">{step.step_name}</div>
                <div className={`text-xs px-2 py-0.5 rounded border ${getStepTypeBadgeClass(step.step_type)}`}>
                  {getStepTypeLabel(step.step_type)}
                </div>
                {step.is_required && (
                  <div className="text-xs px-2 py-0.5 rounded border bg-red-50 text-red-600 border-red-200">
                    إلزامي
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                المعتمد: {getApproverName(step, users)}
              </div>
              {step.instructions && (
                <div className="mt-1 text-xs text-muted-foreground">
                  تعليمات: {step.instructions}
                </div>
              )}
            </div>
            <div className="flex space-x-1 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveStep(index, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveStep(index, 'down')}
                disabled={index === workflowSteps.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => handleDeleteStep(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog for deleting the last step */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              تأكيد حذف الخطوة الأخيرة
            </AlertDialogTitle>
            <AlertDialogDescription>
              أنت على وشك حذف الخطوة الأخيرة في سير العمل. هذا سيؤدي إلى إزالة جميع خطوات سير العمل.
              هل أنت متأكد من الاستمرار؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLastStep}
              className="bg-red-500 hover:bg-red-600"
            >
              نعم، حذف الخطوة الأخيرة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
