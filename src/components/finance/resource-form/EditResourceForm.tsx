
import { BudgetDistribution } from "./BudgetDistribution";
import { BasicInfoFields } from "./BasicInfoFields";
import { FormActions } from "./FormActions";
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
  } = useEditResourceForm(resource, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoFields
        totalAmount={totalAmount}
        obligationsAmount={obligationsAmount}
        handleTotalAmountChange={handleTotalAmountChange}
        handleObligationsChange={handleObligationsChange}
        source={source}
        handleSourceChange={handleSourceChange}
        defaultType={type}
        defaultEntity={entity}
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
      
      <FormActions 
        onCancel={onCancel} 
        isLoading={isLoading} 
        isEdit={true} 
      />
    </form>
  );
};
