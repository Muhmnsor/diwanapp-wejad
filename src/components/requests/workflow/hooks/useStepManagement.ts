
import { WorkflowStep } from "../../types";
import { useAddStep } from "./operations/useAddStep";
import { useRemoveStep } from "./operations/useRemoveStep";
import { useEditStep } from "./operations/useEditStep";
import { useMoveStep } from "./operations/useMoveStep";

interface UseStepManagementProps {
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
}

export const useStepManagement = ({
  saveWorkflowSteps,
  setCurrentStep,
  setEditingStepIndex
}: UseStepManagementProps) => {
  // Use modular operation hooks
  const { handleAddStep } = useAddStep(saveWorkflowSteps, setCurrentStep, setEditingStepIndex);
  const { handleRemoveStep } = useRemoveStep(saveWorkflowSteps, setCurrentStep, setEditingStepIndex);
  const { handleEditStep } = useEditStep(setCurrentStep, setEditingStepIndex);
  const { handleMoveStep } = useMoveStep(saveWorkflowSteps, setEditingStepIndex);

  return {
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
