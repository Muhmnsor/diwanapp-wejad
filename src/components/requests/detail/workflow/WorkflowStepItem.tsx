
import React from 'react';
import { CheckCircle2, CircleDashed, Circle, MessageSquareQuote, Clock, XCircle } from "lucide-react";
import { WorkflowStepItemProps } from "./types";
import { cn } from "@/lib/utils";

export const WorkflowStepItem: React.FC<WorkflowStepItemProps> = ({ 
  step, 
  isCurrent,
  isCompleted
}) => {
  // Check if this is an opinion step
  const isOpinionStep = step.step_type === 'opinion';
  
  // Determine step icon based on status and type
  let StepIcon = CircleDashed;
  let stepIconColor = "text-gray-300";

  if (isCompleted) {
    StepIcon = CheckCircle2;
    stepIconColor = "text-green-500";
  } else if (isCurrent) {
    StepIcon = isOpinionStep ? MessageSquareQuote : Clock;
    stepIconColor = "text-blue-500";
  }
  
  // Determine text color based on status
  const textColor = cn(
    isCurrent && "text-blue-500 font-medium",
    isCompleted && "text-green-500",
    !isCurrent && !isCompleted && "text-muted-foreground"
  );
  
  return (
    <div className={cn(
      "flex items-start py-1.5",
      isCurrent && "animate-pulse-light"
    )}>
      <StepIcon className={cn("h-6 w-6", stepIconColor)} />
      <div className="mr-3 flex-1">
        <p className={cn("text-sm font-medium", textColor)}>
          {step.step_name}
        </p>
        
        <p className="text-xs text-muted-foreground">
          {isOpinionStep ? 'مرحلة إبداء الرأي' : (step.approver_id ? 'موافقة مطلوبة' : 'غير محدد')}
        </p>
        
        {step.instructions && (
          <p className="text-xs mt-1 text-muted-foreground">
            {step.instructions}
          </p>
        )}
      </div>
    </div>
  );
};
