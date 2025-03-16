
import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle,
  ArrowRight, 
  Clock,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStepsListProps } from "./types";

export const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({ 
  steps, 
  currentStepIndex,
  isLoading,
  requestStatus = 'pending'
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-3 rtl:space-x-reverse">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <AlertCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          لا يوجد خطوات محددة لسير العمل
        </p>
      </div>
    );
  }

  const isCompleted = requestStatus === 'completed';

  return (
    <div className="space-y-3 py-1">
      {steps.map((step, index) => {
        // Determine step status based on the current index and request status
        let StepIcon;
        let stepColor;
        let lineColor = "bg-muted"; // Default line color
        
        if (isCompleted) {
          // If request is completed, all steps should be marked as complete
          StepIcon = CheckCircle;
          stepColor = "text-green-500";
          lineColor = "bg-green-500";
        } else if (index < currentStepIndex) {
          // Previous steps - completed
          StepIcon = CheckCircle;
          stepColor = "text-green-500";
          lineColor = "bg-green-500";
        } else if (index === currentStepIndex) {
          // Current step - in progress
          StepIcon = Clock;
          stepColor = "text-blue-500";
          lineColor = "bg-blue-500";
        } else {
          // Future steps - pending
          StepIcon = Circle;
          stepColor = "text-muted-foreground";
        }

        return (
          <div key={step.id} className="relative">
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-7 bottom-0 right-[13px] w-0.5 ${lineColor}`} 
                aria-hidden="true"
              />
            )}
            
            <div className="flex items-start gap-4 relative z-10">
              <div className={`${stepColor} flex-shrink-0 mt-1`}>
                <StepIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 pb-4">
                <h4 className="text-sm font-medium">
                  {step.step_name}
                </h4>
                {step.step_type && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.step_type === 'decision' ? 'قرار' : 
                     step.step_type === 'opinion' ? 'إبداء رأي' : 'تنبيه'}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
