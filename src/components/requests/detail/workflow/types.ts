
import { WorkflowStep } from "../../types";

export interface WorkflowCardProps {
  workflow: {
    id: string;
    name?: string;
    description?: string;
    is_active?: boolean;
    steps?: WorkflowStep[];
  } | null;
  currentStep: WorkflowStep | null;
  requestId: string;
  requestStatus?: string;
  permissions?: {
    canViewWorkflow: boolean;
    isRequester: boolean;
    isAdmin: boolean;
    isInWorkflow: boolean;
  };
}

export interface WorkflowCardDataHookResult {
  isLoading: boolean;
  error: Error | null;
  workflowSteps: WorkflowStep[];
  currentStepIndex: number;
  progressPercentage: number;
  diagnoseWorkflow: () => Promise<any>;
  fixWorkflow: () => Promise<any>;
  refreshWorkflowData: () => Promise<any>;
  hasPermission: boolean;
}

export interface WorkflowStepItemProps {
  step: WorkflowStep;
  isCompleted: boolean;
  isCurrent: boolean;
  isRejected?: boolean;
}
