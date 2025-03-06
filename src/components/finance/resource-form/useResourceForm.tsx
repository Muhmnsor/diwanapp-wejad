
import { useBudgetItems } from "./hooks/useBudgetItems";
import { useFormFields } from "./hooks/useFormFields";
import { useFormSubmit } from "./hooks/useFormSubmit";
import { useResourceObligations } from "./hooks/useResourceObligations";

export const useResourceForm = (onSubmit: () => void) => {
  const {
    obligations,
    totalObligationsAmount,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange
  } = useResourceObligations();

  const {
    budgetItems,
    setBudgetItems,
    useDefaultPercentages,
    calculateValues,
    handleUseDefaultsChange,
    handleItemPercentageChange
  } = useBudgetItems();

  const {
    totalAmount,
    source,
    handleTotalAmountChange,
    handleSourceChange,
  } = useFormFields(calculateValues, setBudgetItems, useDefaultPercentages, totalObligationsAmount);

  const {
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleSubmit: submitForm
  } = useFormSubmit(
    totalAmount,
    totalObligationsAmount,
    source,
    budgetItems,
    useDefaultPercentages,
    obligations,
    onSubmit
  );

  // Adapter for handleUseDefaultsChange to maintain API compatibility
  const adaptedHandleUseDefaultsChange = (value: string) => {
    handleUseDefaultsChange(value, 
      typeof totalAmount === "number" ? totalAmount : 0, 
      totalObligationsAmount);
  };

  // Adapter for handleItemPercentageChange to maintain API compatibility
  const adaptedHandleItemPercentageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleItemPercentageChange(
      id, 
      e, 
      typeof totalAmount === "number" ? totalAmount : 0,
      totalObligationsAmount
    );
  };

  // Create a unified handleSubmit function
  const handleSubmit = (e: React.FormEvent) => {
    submitForm(e);
  };

  return {
    budgetItems,
    useDefaultPercentages,
    totalAmount,
    obligations,
    totalObligationsAmount,
    source,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleSourceChange,
    handleUseDefaultsChange: adaptedHandleUseDefaultsChange,
    handleItemPercentageChange: adaptedHandleItemPercentageChange,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange,
    handleSubmit,
  };
};
