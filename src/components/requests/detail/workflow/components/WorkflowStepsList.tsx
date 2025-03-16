
import React from 'react';
import { WorkflowStepsList as BaseWorkflowStepsList } from '../WorkflowStepsList';
import { WorkflowStep } from '../../../types';

export interface WorkflowStepsListComponentProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading: boolean;
  requestStatus?: string;
}

export const WorkflowStepsListComponent: React.FC<WorkflowStepsListComponentProps> = (props) => {
  return <BaseWorkflowStepsList {...props} />;
};
