
import { TargetsHeader } from "./targets/TargetsHeader";
import { TargetForm } from "./targets/TargetForm";
import { TargetsContainer } from "./targets/TargetsContainer";
import { useTargetsData } from "./targets/hooks/useTargetsData";
import { useTargetFormState } from "./targets/hooks/useTargetFormState";
import { useTargetActions } from "./targets/hooks/useTargetActions";

export const TargetsTab = () => {
  // Load targets and budget items data
  const { targets, setTargets, budgetItems, loading, loadTargets } = useTargetsData();
  
  // Form state management
  const { 
    showAddForm, 
    setShowAddForm, 
    editingTarget, 
    setEditingTarget,
    formData,
    handleInputChange,
    handleSelectChange,
    resetForm,
    toggleAddForm,
    handleEdit,
    cancelEditing
  } = useTargetFormState();
  
  // Target actions (add, update, delete)
  const { handleSubmit, handleUpdate, handleDelete } = useTargetActions(
    loadTargets,
    setTargets,
    formData,
    resetForm,
    setShowAddForm,
    setEditingTarget
  );

  const onUpdate = () => {
    if (!editingTarget) return;
    handleUpdate(editingTarget);
  };

  return (
    <div className="space-y-6">
      <TargetsHeader onAddNew={toggleAddForm} />

      {(showAddForm || editingTarget) && (
        <TargetForm
          budgetItems={budgetItems}
          editingTarget={editingTarget}
          onSubmit={handleSubmit}
          onUpdate={onUpdate}
          onCancel={editingTarget ? cancelEditing : () => setShowAddForm(false)}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />
      )}

      <TargetsContainer
        targets={targets}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
