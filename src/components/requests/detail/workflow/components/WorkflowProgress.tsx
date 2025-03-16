
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface WorkflowProgressProps {
  progressPercentage: number;
  isWorkflowCompleted: boolean;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  progressPercentage, 
  isWorkflowCompleted 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">تقدم الطلب</h4>
        <span className="text-sm text-muted-foreground">
          {isWorkflowCompleted ? (
            <span className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              مكتمل
            </span>
          ) : (
            `${Math.round(progressPercentage)}%`
          )}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className={isWorkflowCompleted ? "bg-green-100" : ""} 
        indicatorClassName={isWorkflowCompleted ? "bg-green-500" : ""}
      />
    </div>
  );
};
