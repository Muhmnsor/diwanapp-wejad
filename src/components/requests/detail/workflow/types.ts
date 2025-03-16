
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
}

export interface WorkflowStepItemProps {
  step: WorkflowStep;
  isCompleted: boolean;
  isCurrent: boolean;
}
