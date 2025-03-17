
import { WorkflowStep } from "../../types";

export interface WorkflowCardProps {
  workflow?: { 
    id: string; 
    name?: string; 
    description?: string; 
  } | null;
  currentStep?: WorkflowStep | null;
  requestId: string;
  requestStatus?: string;
}

export interface CurrentStepDisplayProps {
  currentStep?: WorkflowStep | null;
  requestStatus?: string;
  isLoading?: boolean;
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

export interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<void>;
  onFix: () => Promise<void>;
  onSuccess: () => Promise<void>;
  isDiagnosing: boolean;
  diagnosticResult: any | null;
  className?: string;
}
