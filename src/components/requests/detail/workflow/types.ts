
import { WorkflowStep } from "../../types";

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
