
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, AlertCircle } from "lucide-react";
import { WorkflowStep } from "../../types";
import { cn } from "@/lib/utils";
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading?: boolean;
  requestStatus?: string;
}

export const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({
  steps,
  currentStepIndex,
  isLoading = false,
  requestStatus = 'pending'
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-3 border border-dashed rounded-md">
        <p className="text-sm text-muted-foreground">لا توجد خطوات لعرضها</p>
      </div>
    );
  }

  const isCompleted = requestStatus === 'completed';

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        // Determine step status
        let status: 'completed' | 'current' | 'upcoming' | 'opinion-processed';
        
        if (isCompleted) {
          status = 'completed';
        } else if (index === currentStepIndex) {
          status = 'current';
        } else if (index < currentStepIndex || (step.step_type === 'opinion' && index <= currentStepIndex)) {
          // For opinion steps, mark as "processed" rather than completed if they're not the current step
          // but they've been processed (index <= currentStepIndex)
          status = step.step_type === 'opinion' && index !== currentStepIndex ? 'opinion-processed' : 'completed';
        } else {
          status = 'upcoming';
        }

        return (
          <div 
            key={step.id} 
            className={cn(
              "flex items-center p-2 rounded-md",
              status === 'current' && "bg-blue-50 border border-blue-200",
              status === 'completed' && "bg-green-50 border border-green-100",
              status === 'opinion-processed' && "bg-purple-50 border border-purple-100",
              status === 'upcoming' && "bg-gray-50 border border-gray-100"
            )}
          >
            <div className="flex-shrink-0 mr-3">
              {status === 'completed' && (
                <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              {status === 'opinion-processed' && (
                <div className="h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              {status === 'current' && (
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              )}
              {status === 'upcoming' && (
                <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{index + 1}</span>
                </div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  status === 'current' && "text-blue-700",
                  status === 'completed' && "text-green-700",
                  status === 'opinion-processed' && "text-purple-700",
                  status === 'upcoming' && "text-gray-700"
                )}>
                  {step.step_name}
                </h4>
                {step.step_type && (
                  <WorkflowStatusBadge status={step.step_type} size="xs" />
                )}
              </div>
              
              {step.instructions && (
                <p className="text-xs text-gray-500 truncate">
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
