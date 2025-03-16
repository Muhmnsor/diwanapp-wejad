
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface WorkflowProgressProps {
  progressPercentage: number;
  isWorkflowCompleted: boolean;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  progressPercentage, 
  isWorkflowCompleted 
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>التقدم في سير العمل</span>
        <span>
          {isWorkflowCompleted ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              مكتمل
            </span>
          ) : (
            `${Math.round(progressPercentage)}%`
          )}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2"
        indicatorClassName={
          progressPercentage >= 100 
            ? "bg-green-500" 
            : progressPercentage > 60 
            ? "bg-blue-500" 
            : "bg-primary"
        }
      />
    </div>
  );
};
