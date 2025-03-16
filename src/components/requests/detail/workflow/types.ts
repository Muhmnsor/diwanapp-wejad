
import { WorkflowStep } from "../../types";

export interface CurrentStepDisplayProps {
  currentStep: WorkflowStep | null;
  requestStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  isLoading?: boolean;
}

export interface WorkflowCardProps {
  workflow: any | null;
  currentStep: WorkflowStep | null;
  requestId: string;
  requestStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface WorkflowCardDataHookResult {
  isLoading: boolean;
  error: Error | null;
  workflowSteps: WorkflowStep[];
  currentStepIndex: number;
  progressPercentage: number;
  diagnoseWorkflow: () => Promise<any>;
  fixWorkflow: () => Promise<any>;
  refreshWorkflowData: () => Promise<void>;
}

export interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isLoading: boolean;
  requestStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface WorkflowStepItemProps {
  step: WorkflowStep;
  isCurrent: boolean;
  isCompleted: boolean;
}

export interface WorkflowStatusBadgeProps {
  status: 'decision' | 'opinion' | 'approval' | 'review' | 'completed' | 'pending' | string;
}
