
import React from 'react';
import { WorkflowStepsList as OriginalWorkflowStepsList } from "../WorkflowStepsList";
import { WorkflowStep } from "../../../types";

interface WorkflowStepsListComponentProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading: boolean;
  requestStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export const WorkflowStepsListComponent: React.FC<WorkflowStepsListComponentProps> = ({ 
  steps, 
  currentStepIndex, 
  isLoading,
  requestStatus = 'pending'
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">خطوات سير العمل</h4>
      <OriginalWorkflowStepsList 
        steps={steps}
        currentStepIndex={currentStepIndex}
        isLoading={isLoading}
        requestStatus={requestStatus}
      />
    </div>
  );
};
