
import { WorkflowStep } from "../../types";
import { RequestStatus } from "@/types/meeting";

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

export interface CurrentStepDisplayProps {
  currentStep: any;
  requestStatus: RequestStatus | string;
  isLoading?: boolean;
}
