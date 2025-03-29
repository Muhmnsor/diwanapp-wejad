
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

// Helper function to check if a string is a valid RequestStatus
export function isValidRequestStatus(status: string): status is RequestStatus {
  const validStatuses: RequestStatus[] = ['pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'];
  return validStatuses.includes(status as RequestStatus);
}

// Function to safely convert a string to RequestStatus
export function toRequestStatus(status: string | RequestStatus): RequestStatus {
  if (isValidRequestStatus(status)) {
    return status;
  }
  return 'pending'; // Default fallback
}
