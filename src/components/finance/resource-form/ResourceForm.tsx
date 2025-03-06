
import { ResourceFormProps } from "./types";
import { BasicInfoFields } from "./BasicInfoFields";
import { BudgetDistribution } from "./BudgetDistribution";
import { FormActions } from "./FormActions";
import { ObligationsSection } from "./ObligationsSection";
import { useResourceForm } from "./useResourceForm";

export const ResourceForm = ({ onCancel, onSubmit }: ResourceFormProps) => {
  const {
    budgetItems,
    useDefaultPercentages,
    totalAmount,
    obligations,
    totalObligationsAmount,
    source,
    customSource,
    isLoading,
    totalPercentage,
    isValidPercentages,
    handleTotalAmountChange,
    handleSourceChange,
    handleCustomSourceChange,
    handleUseDefaultsChange,
    handleItemPercentageChange,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange,
    handleSubmit,
  } = useResourceForm(onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      <BasicInfoFields
        totalAmount={totalAmount}
        handleTotalAmountChange={handleTotalAmountChange}
        source={source}
        handleSourceChange={handleSourceChange}
        customSource={customSource}
        handleCustomSourceChange={handleCustomSourceChange}
      />

      <ObligationsSection
        obligations={obligations}
        onAddObligation={handleAddObligation}
        onRemoveObligation={handleRemoveObligation}
        onObligationChange={handleObligationChange}
        totalObligations={totalObligationsAmount}
      />

      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-right">
        <p className="text-green-800 font-medium">صافي المبلغ (ريال): {typeof totalAmount === "number" ? (totalAmount - totalObligationsAmount).toLocaleString() : "0"}</p>
      </div>

      <BudgetDistribution
        budgetItems={budgetItems}
        useDefaultPercentages={useDefaultPercentages}
        handleUseDefaultsChange={handleUseDefaultsChange}
        handleItemPercentageChange={handleItemPercentageChange}
        totalPercentage={totalPercentage}
        isValidPercentages={isValidPercentages}
        totalAmount={totalAmount}
        totalObligationsAmount={totalObligationsAmount}
      />

      <FormActions onCancel={onCancel} isLoading={isLoading} />
    </form>
  );
};
