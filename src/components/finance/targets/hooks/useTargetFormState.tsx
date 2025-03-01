
import { useState } from "react";
import { FinancialTarget } from "../TargetsDataService";

export type TargetFormData = {
  year: number;
  quarter: number;
  period_type: string;
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
    period_type: "quarterly",
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
    if (name === "period_type") {
      // إذا تم تغيير نوع الفترة، نحدث قيمة الربع تلقائيًا
      if (value === "yearly") {
        setFormData({
          ...formData,
          period_type: value,
          quarter: 0
        });
      } else {
        // إذا كان التغيير من سنوي إلى ربعي، نضبط الربع إلى 1
        if (formData.period_type === "yearly") {
          setFormData({
            ...formData,
            period_type: value,
            quarter: 1
          });
        } else {
          // في حالة التغيير بين الأرباع
          setFormData({
            ...formData,
            period_type: value
          });
        }
      }
    } else if (name === "quarter") {
      // تحديث قيمة الربع
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value === "none" ? undefined : value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      quarter: 1,
      period_type: "quarterly",
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
      period_type: target.period_type,
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
