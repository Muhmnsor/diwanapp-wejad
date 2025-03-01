
import { useState } from "react";
import { FinancialTarget } from "../TargetsDataService";

export type TargetFormData = {
  year: number;
  quarter: number;
  type: string;
  target_amount: number;
  actual_amount: number;
  budget_item_id?: string;
  resource_source?: string;
};

export function useTargetFormState() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<FinancialTarget | null>(null);
  
  // حالة النموذج
  const [formData, setFormData] = useState<TargetFormData>({
    year: new Date().getFullYear(),
    quarter: 1,
    type: "موارد",
    target_amount: 0,
    actual_amount: 0,
    budget_item_id: undefined,
    resource_source: undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "year" || name === "quarter" || name === "target_amount" || name === "actual_amount" 
        ? parseFloat(value) 
        : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value === "none" ? undefined : value,
    });
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      quarter: 1,
      type: "موارد",
      target_amount: 0,
      actual_amount: 0,
      budget_item_id: undefined,
      resource_source: undefined,
    });
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (editingTarget) {
      cancelEditing();
    }
  };

  const handleEdit = (target: FinancialTarget) => {
    setEditingTarget(target);
    setFormData({
      year: target.year,
      quarter: target.quarter,
      type: target.type,
      target_amount: target.target_amount,
      actual_amount: target.actual_amount,
      budget_item_id: target.budget_item_id,
      resource_source: target.resource_source,
    });
  };

  const cancelEditing = () => {
    setEditingTarget(null);
    resetForm();
  };

  return {
    showAddForm,
    setShowAddForm,
    editingTarget,
    setEditingTarget,
    formData,
    setFormData,
    handleInputChange,
    handleSelectChange,
    resetForm,
    toggleAddForm,
    handleEdit,
    cancelEditing
  };
}
