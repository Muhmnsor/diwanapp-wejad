
import React from 'react';
import { CheckCircle2, CircleDashed, Clock, MessageSquareQuote, XCircle } from "lucide-react";
import { WorkflowStepItemProps } from "./types";
import { cn } from "@/lib/utils";

export const WorkflowStepItem: React.FC<WorkflowStepItemProps> = ({ 
  step, 
  isCurrent,
  isCompleted,
  isRejected = false
}) => {
  // Check if this is an opinion step
  const isOpinionStep = step.step_type === 'opinion';
  
  // Determine step icon based on status and type
  let StepIcon = CircleDashed;
  let stepIconColor = "text-gray-300";

  if (isRejected) {
    StepIcon = XCircle;
    stepIconColor = "text-red-500";
  } else if (isCompleted) {
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
    isRejected && "text-red-500",
    !isCurrent && !isCompleted && !isRejected && "text-muted-foreground"
  );
  
  // Display approver information with appropriate label based on step type
  const approverInfo = step.approver_id ? 
    (step.approver_name ? 
      isOpinionStep ? `تم إبداء الرأي بواسطة: ${step.approver_name}` : `الموافق: ${step.approver_name}` 
      : 
      isOpinionStep ? `تم إبداء الرأي بواسطة: ${step.approver_id}` : `الموافق: ${step.approver_id}`) 
    : 
    isOpinionStep ? 'إبداء رأي مطلوب' : 'موافقة مطلوبة';
  
  return (
    <div className={cn(
      "flex items-start py-1.5",
      isCurrent && "animate-pulse-light"
    )}>
      <StepIcon className={cn("h-6 w-6 ml-2", stepIconColor)} />
      <div className="flex-1">
        <p className={cn("text-sm font-medium", textColor)}>
          {step.step_name || 'خطوة غير معرفة'}
        </p>
        
        <p className="text-xs text-muted-foreground">
          {isOpinionStep ? 'مرحلة إبداء الرأي' : approverInfo}
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
