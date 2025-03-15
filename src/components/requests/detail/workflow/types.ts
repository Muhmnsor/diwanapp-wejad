
import { WorkflowStep } from "../../types";

export interface WorkflowCardProps {
  workflow?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  currentStep?: WorkflowStep | null;
  requestId: string;
}

export interface WorkflowStepItemProps {
  step: WorkflowStep;
  isCurrent: boolean;
  isCompleted: boolean;
}

export interface CurrentStepDisplayProps {
  currentStep?: WorkflowStep | null;
  isLoading?: boolean;
}

export interface WorkflowStatusBadgeProps {
  status: string;
}

export interface WorkflowCardDataHookResult {
  isLoading: boolean;
  error: Error | null;
  workflowSteps: WorkflowStep[];
  currentStepIndex: number;
  diagnoseWorkflow: () => Promise<any>;
  refreshWorkflowData: () => void;
}
