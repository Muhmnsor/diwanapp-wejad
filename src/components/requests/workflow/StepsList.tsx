
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import { WorkflowStep, User } from "../types";
import { getApproverName } from "./utils";

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
  onRemoveStep 
}: StepsListProps) => {
  if (workflowSteps.length === 0) {
    return null;
  }

  return (
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
                المعتمد: {getApproverName(step, users)}
                {step.is_required ? " (إلزامي)" : " (اختياري)"}
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMoveStep(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMoveStep(index, 'down')}
                disabled={index === workflowSteps.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => onRemoveStep(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
