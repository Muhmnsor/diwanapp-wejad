
import { ResourceFormProps } from "./types";
import { BasicInfoFields } from "./BasicInfoFields";
import { BudgetDistribution } from "./BudgetDistribution";
import { FormActions } from "./FormActions";
import { useResourceForm } from "./useResourceForm";

export const ResourceForm = ({ onCancel, onSubmit }: ResourceFormProps) => {
  const {
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
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleSubmit,
  } = useResourceForm(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <BasicInfoFields
        totalAmount={totalAmount}
        obligationsAmount={obligationsAmount}
        handleTotalAmountChange={handleTotalAmountChange}
        handleObligationsChange={handleObligationsChange}
        source={source}
        handleSourceChange={handleSourceChange}
      />

      <BudgetDistribution
        budgetItems={budgetItems}
        useDefaultPercentages={useDefaultPercentages}
        handleUseDefaultsChange={handleUseDefaultsChange}
        handleItemPercentageChange={handleItemPercentageChange}
        totalPercentage={totalPercentage}
        isValidPercentages={isValidPercentages}
        totalAmount={totalAmount}
        obligationsAmount={obligationsAmount}
      />

      <FormActions onCancel={onCancel} isLoading={isLoading} />
    </form>
  );
};
