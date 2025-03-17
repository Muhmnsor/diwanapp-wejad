
import React from 'react';
import { WorkflowStep } from "../../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

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
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md border-dashed">
        <p className="text-muted-foreground">لا توجد خطوات لمسار سير العمل</p>
      </div>
    );
  }

  // Function to get step status
  const getStepStatus = (index: number) => {
    const isCompleted = requestStatus === 'completed' || index < currentStepIndex;
    const isCurrent = index === currentStepIndex;
    
    return { isCompleted, isCurrent };
  };

  // Get step type label
  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case 'decision': return 'قرار';
      case 'opinion': return 'رأي';
      case 'notification': return 'إشعار';
      case 'review': return 'مراجعة';
      default: return 'خطوة';
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const { isCompleted, isCurrent } = getStepStatus(index);
        
        return (
          <div 
            key={step.id} 
            className={cn(
              "flex items-start p-3 rounded-md border relative",
              isCurrent ? "border-primary bg-primary/5" : 
              isCompleted ? "border-green-200 bg-green-50" : 
              "border-gray-200 bg-gray-50"
            )}
          >
            <div className="flex-shrink-0 mt-1">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : isCurrent ? (
                <Circle className="h-5 w-5 text-primary fill-primary/20" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            
            <div className="mr-3 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={cn(
                    "font-medium text-sm",
                    isCurrent ? "text-primary" : 
                    isCompleted ? "text-green-700" : 
                    "text-gray-700"
                  )}>
                    {step.step_name}
                  </h4>
                  <div className="flex space-x-2 items-center mt-1">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs px-2 py-0 h-5",
                        step.step_type === 'decision' ? "bg-blue-50 border-blue-200 text-blue-700" :
                        step.step_type === 'opinion' ? "bg-purple-50 border-purple-200 text-purple-700" :
                        step.step_type === 'notification' ? "bg-amber-50 border-amber-200 text-amber-700" :
                        step.step_type === 'review' ? "bg-green-50 border-green-200 text-green-700" :
                        "bg-gray-50 border-gray-200 text-gray-700"
                      )}
                    >
                      {getStepTypeLabel(step.step_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      isCompleted ? "bg-green-100 text-green-800 border-green-200" : 
                      isCurrent ? "bg-blue-100 text-blue-800 border-blue-200" : 
                      "bg-gray-100 text-gray-800 border-gray-200"
                    )}
                  >
                    {step.step_order}
                  </Badge>
                </div>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="absolute bottom-0 left-4 h-3 w-5 bg-white flex justify-center">
                <ArrowRight className="h-3 w-3 text-gray-400 -rotate-90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
