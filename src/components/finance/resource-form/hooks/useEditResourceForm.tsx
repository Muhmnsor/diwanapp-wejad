
import { useEditResourceData } from "./useEditResourceData";
import { useEditFormState } from "./useEditFormState";
import { useEditFormSubmit } from "./useEditFormSubmit";

interface Resource {
  id: string;
  date: string;
  source: string;
  type: string;
  entity: string;
  total_amount: number;
  obligations_amount: number;
  net_amount: number;
}

export const useEditResourceForm = (resource: Resource, onSubmit: () => void) => {
  const {
    budgetItems,
    setBudgetItems,
    obligations,
    setObligations,
    useDefaultPercentages,
    setUseDefaultPercentages,
    isLoading,
    setIsLoading
  } = useEditResourceData(resource.id);

  const {
    totalAmount,
    totalObligationsAmount,
    source,
    type,
    entity,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange
  } = useEditFormState(
    resource, 
    budgetItems, 
    setBudgetItems,
    obligations,
    setObligations,
    useDefaultPercentages, 
    setUseDefaultPercentages
  );

  const { handleSubmit: submitForm } = useEditFormSubmit();

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    submitForm({
      resourceId: resource.id,
      totalAmount,
      source,
      type,
      entity,
      budgetItems,
      obligations,
      isValidPercentages,
      useDefaultPercentages,
      setIsLoading,
      onComplete: onSubmit
    }, e);
  };

  return {
    budgetItems,
    obligations,
    totalObligationsAmount,
    useDefaultPercentages,
    totalAmount,
    source,
    type,
    entity,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange,
    handleSubmit
  };
};
