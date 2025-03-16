
import React from 'react';
import { CheckCircle, Circle, ArrowRight, Clock, XCircle, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkflowStep } from '../../types';

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading: boolean;
  requestStatus?: string;
}

export const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({
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
        const isCompleted = isRejected ? false : 
                           (requestStatus === 'completed' ? true : index < currentStepIndex);
        const isFuture = !isPending && !isCompleted;
        const isOpinionStep = step.step_type === 'opinion';

        // Set the indicator icon
        let StepIcon = Circle;
        let stepIconColor = "text-gray-300";

        if (isCompleted) {
          StepIcon = CheckCircle;
          stepIconColor = "text-green-500";
        } else if (isPending) {
          StepIcon = isOpinionStep ? MessageSquareQuote : Clock;
          stepIconColor = "text-blue-500";
        } else if (isRejected && index >= currentStepIndex) {
          StepIcon = XCircle;
          stepIconColor = "text-red-500";
        }

        // Determine the appropriate text to show based on step type
        let approverText = '';
        if (isOpinionStep) {
          // Fixed: simplified text for opinion steps
          approverText = step.approver_id && isCompleted 
            ? 'تم إبداء الرأي' 
            : 'مرحلة إبداء الرأي';
        } else {
          // Fixed: simplified text for approval steps
          approverText = step.approver_id && isPending 
            ? 'موافقة مطلوبة' 
            : (isCompleted ? 'تمت الموافقة' : 'غير محدد');
        }

        return (
          <div 
            key={step.id || index} 
            className={cn(
              "flex items-start",
              isPending && "animate-pulse-light"
            )}
          >
            <StepIcon className={cn("h-6 w-6", stepIconColor)} />
            <div className="mr-3 flex-1">
              <p className={cn(
                "text-sm font-medium",
                isPending && "text-blue-500",
                isCompleted && "text-green-500",
                isRejected && index >= currentStepIndex && "text-red-500",
                isFuture && "text-muted-foreground"
              )}>
                {step.step_name}
              </p>
              
              <p className="text-xs text-muted-foreground">
                {approverText}
              </p>
              
              {step.instructions && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {step.instructions}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
