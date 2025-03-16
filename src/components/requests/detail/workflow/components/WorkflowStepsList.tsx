
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStep } from "../../../types";
import { WorkflowStepItem } from "../WorkflowStepItem";

export interface WorkflowStepsListComponentProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading: boolean;
  requestStatus?: string;
}

export const WorkflowStepsListComponent: React.FC<WorkflowStepsListComponentProps> = ({
  steps,
  currentStepIndex,
  isLoading,
  requestStatus = 'pending'
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="mr-3 space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle empty steps
  if (!steps || steps.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        لم يتم تعريف خطوات لمسار العمل
      </div>
    );
  }

  // All steps are completed when request status is completed
  const isCompleted = requestStatus === 'completed';
  // Request was rejected
  const isRejected = requestStatus === 'rejected';

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        // Determine step status
        const isPending = currentStepIndex === index;
        const isStepCompleted = isRejected ? false : 
                            (requestStatus === 'completed' ? true : index < currentStepIndex);
        
        return (
          <WorkflowStepItem
            key={step.id || index}
            step={step}
            isCurrent={isPending}
            isCompleted={isStepCompleted}
          />
        );
      })}
    </div>
  );
};
