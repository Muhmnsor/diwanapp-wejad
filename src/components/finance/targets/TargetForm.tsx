
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialTarget, BudgetItem } from "./TargetsDataService";
import { TargetFormData } from "./hooks/useTargetFormState";
import { FormHeader } from "./form/FormHeader";
import { BasicFields } from "./form/BasicFields";
import { ResourceSourceField } from "./form/ResourceSourceField";
import { AmountAndBudgetFields } from "./form/AmountAndBudgetFields";
import { FormActions } from "./form/FormActions";

type TargetFormProps = {
  budgetItems: BudgetItem[];
  editingTarget: FinancialTarget | null;
  onSubmit: (e: React.FormEvent) => void;
  onUpdate: () => void;
  onCancel: () => void;
  formData: TargetFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
};

export const TargetForm = ({
  budgetItems,
  editingTarget,
  onSubmit,
  onUpdate,
  onCancel,
  formData,
  handleInputChange,
  handleSelectChange,
}: TargetFormProps) => {
  // State to control the visibility of resource source field
  const [showResourceSource, setShowResourceSource] = useState(formData.type === "موارد");

  // Update showResourceSource when formData.type changes
  useEffect(() => {
    setShowResourceSource(formData.type === "موارد");
  }, [formData.type]);

  return (
    <Card>
      <FormHeader editingTarget={editingTarget} />
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BasicFields 
              formData={formData}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
            
            <ResourceSourceField 
              resourceSource={formData.resource_source}
              handleSelectChange={handleSelectChange}
              show={showResourceSource}
            />
            
            <AmountAndBudgetFields 
              formData={formData}
              budgetItems={budgetItems}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
          </div>
          
          <FormActions 
            editingTarget={editingTarget}
            onCancel={onCancel}
            onUpdate={onUpdate}
          />
        </form>
      </CardContent>
    </Card>
  );
};
