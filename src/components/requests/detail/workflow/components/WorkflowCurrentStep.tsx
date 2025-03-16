
import React from 'react';
import { CurrentStepDisplay } from "../CurrentStepDisplay";
import { WorkflowStep } from "../../../types";

interface WorkflowCurrentStepProps {
  currentStep: WorkflowStep | null;
  requestStatus: string;
  isLoading: boolean;
}

export const WorkflowCurrentStep: React.FC<WorkflowCurrentStepProps> = ({ 
  currentStep, 
  requestStatus, 
  isLoading 
}) => {
  return (
    <div className="mb-2">
      <h4 className="text-sm font-medium mb-2">الخطوة الحالية</h4>
      <CurrentStepDisplay 
        currentStep={currentStep} 
        requestStatus={requestStatus}
        isLoading={isLoading} 
      />
    </div>
  );
};
