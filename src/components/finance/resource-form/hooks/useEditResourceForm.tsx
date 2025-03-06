
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
    useDefaultPercentages,
    setUseDefaultPercentages,
    isLoading,
    setIsLoading
  } = useEditResourceData(resource.id);

  const {
    totalAmount,
    obligationsAmount,
    source,
    type,
    entity,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange
  } = useEditFormState(resource, budgetItems, setBudgetItems, useDefaultPercentages, setUseDefaultPercentages);

  const { handleSubmit: submitForm } = useEditFormSubmit();

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    submitForm({
      resourceId: resource.id,
      totalAmount,
      obligationsAmount,
      source,
      type,
      entity,
      budgetItems,
      isValidPercentages,
      useDefaultPercentages,
      setIsLoading,
      onComplete: onSubmit
    }, e);
  };

  return {
    budgetItems,
    useDefaultPercentages,
    totalAmount,
    obligationsAmount,
    source,
    type,
    entity,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleSubmit
  };
};
