
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TargetsContainer } from "./targets/TargetsContainer";
import { TargetForm } from "./targets/TargetForm";
import { useTargetsData } from "./targets/hooks/useTargetsData";
import { useTargetFormState } from "./targets/hooks/useTargetFormState";
import { useTargetActions } from "./targets/hooks/useTargetActions";
import { FinancialTarget } from "./targets/TargetsDataService";
import { TargetsHeader } from "./targets/TargetsHeader";

export const TargetsTab = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<FinancialTarget | null>(null);

  const { targets, setTargets, budgetItems, loading, loadTargets } = useTargetsData();
  const { formData, setFormData, resetForm, handleInputChange, handleSelectChange } = useTargetFormState();
  const { handleSubmit, handleUpdate, handleDelete } = useTargetActions(
    loadTargets,
    setTargets,
    formData,
    resetForm,
    setShowAddForm,
    setEditingTarget
  );

  const handleOpenAddForm = () => {
    resetForm();
    setShowAddForm(true);
    setEditingTarget(null);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowAddForm(false);
    setEditingTarget(null);
  };

  const handleEditTarget = (target: FinancialTarget) => {
    setFormData({
      year: target.year,
      quarter: target.quarter,
      period_type: target.period_type,
      type: target.type,
      target_amount: target.target_amount,
      actual_amount: target.actual_amount,
      budget_item_id: target.budget_item_id || "",
      resource_source: target.resource_source || "",
    });
    setEditingTarget(target);
    setShowAddForm(true);
  };

  const handleUpdateTarget = () => {
    if (editingTarget) {
      handleUpdate(editingTarget);
    }
  };

  return (
    <div className="space-y-4">
      <TargetsHeader onOpenAddForm={handleOpenAddForm} />

      {showAddForm && (
        <TargetForm
          budgetItems={budgetItems}
          editingTarget={editingTarget}
          onSubmit={handleSubmit}
          onUpdate={handleUpdateTarget}
          onCancel={handleCancelForm}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />
      )}

      <TargetsContainer
        targets={targets}
        loading={loading}
        onEdit={handleEditTarget}
        onDelete={handleDelete}
        budgetItems={budgetItems}
      />
    </div>
  );
};
