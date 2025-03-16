
import React from 'react';
import { CheckCircle2, CircleDashed, Circle } from "lucide-react";
import { WorkflowStepItemProps } from "./types";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";

export const WorkflowStepItem: React.FC<WorkflowStepItemProps> = ({ 
  step, 
  isCurrent,
  isCompleted
}) => {
  // Status icon based on step status
  const StepIcon = isCompleted 
    ? CheckCircle2 
    : isCurrent 
    ? Circle 
    : CircleDashed;

  // Colors based on status
  const iconColor = isCompleted 
    ? "text-green-500" 
    : isCurrent 
    ? "text-blue-500" 
    : "text-gray-300";
  
  const textColor = isCompleted 
    ? "text-green-600" 
    : isCurrent 
    ? "text-blue-600 font-medium" 
    : "text-gray-500";
  
  return (
    <div className="flex items-center py-1.5 group">
      <div className={`flex-shrink-0 ${iconColor}`}>
        <StepIcon className="h-5 w-5" />
      </div>
      <div className={`mr-2 text-sm ${textColor} flex-grow flex justify-between items-center`}>
        <span>{step.step_name}</span>
        {step.step_type && (
          <span className="mr-auto">
            <WorkflowStatusBadge status={step.step_type} />
          </span>
        )}
      </div>
    </div>
  );
};
