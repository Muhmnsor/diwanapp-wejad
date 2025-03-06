
import { BudgetDistribution } from "./BudgetDistribution";
import { BasicInfoFields } from "./BasicInfoFields";
import { FormActions } from "./FormActions";
import { ObligationsSection } from "./ObligationsSection";
import { useEditResourceForm } from "./hooks/useEditResourceForm";

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

interface EditResourceFormProps {
  resource: Resource;
  onCancel: () => void;
  onSubmit: () => void;
}

export const EditResourceForm = ({ resource, onCancel, onSubmit }: EditResourceFormProps) => {
  const {
    budgetItems,
    obligations,
    totalObligationsAmount,
    useDefaultPercentages,
    totalAmount,
    source,
    customSource,
    type,
    entity,
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
    handleSubmit
  } = useEditResourceForm(resource, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoFields
        totalAmount={totalAmount}
        handleTotalAmountChange={handleTotalAmountChange}
        source={source}
        handleSourceChange={handleSourceChange}
        customSource={customSource}
        handleCustomSourceChange={handleCustomSourceChange}
        defaultType={type}
        defaultEntity={entity}
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
      
      <FormActions 
        onCancel={onCancel} 
        isLoading={isLoading} 
        isEdit={true} 
      />
    </form>
  );
};
