
import React from 'react';
import { WorkflowStep } from "../../types";
import { WorkflowStepItem } from "./WorkflowStepItem";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading?: boolean;
}

export const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({ 
  steps, 
  currentStepIndex,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-full mr-2" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground text-sm">
          لم يتم تكوين خطوات لسير العمل
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => (
        <WorkflowStepItem
          key={step.id || index}
          step={step}
          isCurrent={index === currentStepIndex}
          isCompleted={index < currentStepIndex}
        />
      ))}
    </div>
  );
};
