
import { useBudgetItems } from "./hooks/useBudgetItems";
import { useFormFields } from "./hooks/useFormFields";
import { useFormSubmit } from "./hooks/useFormSubmit";

export const useResourceForm = (onSubmit: () => void) => {
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
    obligationsAmount,
    source,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
  } = useFormFields(calculateValues, setBudgetItems, useDefaultPercentages);

  const {
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleSubmit
  } = useFormSubmit(
    totalAmount,
    obligationsAmount,
    source,
    budgetItems,
    useDefaultPercentages,
    onSubmit
  );

  // Adapter for handleUseDefaultsChange to maintain API compatibility
  const adaptedHandleUseDefaultsChange = (value: string) => {
    handleUseDefaultsChange(value, 
      typeof totalAmount === "number" ? totalAmount : 0, 
      typeof obligationsAmount === "number" ? obligationsAmount : 0);
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
      typeof obligationsAmount === "number" ? obligationsAmount : 0
    );
  };

  return {
    budgetItems,
    useDefaultPercentages,
    totalAmount,
    obligationsAmount,
    source,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
    handleUseDefaultsChange: adaptedHandleUseDefaultsChange,
    handleItemPercentageChange: adaptedHandleItemPercentageChange,
    handleSubmit,
  };
};
