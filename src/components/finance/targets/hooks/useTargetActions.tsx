
import { useState } from "react";
import { toast } from "sonner";
import { 
  FinancialTarget, 
  addTarget, 
  updateTarget, 
  deleteTarget
} from "../TargetsDataService";
import { TargetFormData } from "./useTargetFormState";

export function useTargetActions(
  loadTargets: () => Promise<void>,
  setTargets: React.Dispatch<React.SetStateAction<FinancialTarget[]>>,
  formData: TargetFormData,
  resetForm: () => void,
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingTarget: React.Dispatch<React.SetStateAction<FinancialTarget | null>>
) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTarget({
        year: formData.year,
        quarter: formData.quarter,
        period_type: formData.period_type,
        type: formData.type,
        target_amount: formData.target_amount,
        actual_amount: formData.actual_amount,
        budget_item_id: formData.budget_item_id,
        resource_source: formData.resource_source,
      });
      
      toast.success("تم إضافة المستهدف بنجاح");
      setShowAddForm(false);
      resetForm();
      loadTargets(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error("Error adding target:", error);
      if (error.code === "23505") {
        toast.error("هذا المستهدف موجود بالفعل للربع والسنة المحددة");
      } else {
        toast.error("حدث خطأ أثناء إضافة المستهدف");
      }
    }
  };

  const handleUpdate = async (editingTarget: FinancialTarget) => {
    try {
      await updateTarget(editingTarget.id, {
        year: formData.year,
        quarter: formData.quarter,
        period_type: formData.period_type,
        type: formData.type,
        target_amount: formData.target_amount,
        actual_amount: formData.actual_amount,
        budget_item_id: formData.budget_item_id,
        resource_source: formData.resource_source,
      });
      
      toast.success("تم تحديث المستهدف بنجاح");
      setEditingTarget(null);
      resetForm();
      loadTargets(); // إعادة تحميل البيانات
    } catch (error) {
      console.error("Error updating target:", error);
      toast.error("حدث خطأ أثناء تحديث المستهدف");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المستهدف؟")) return;
    
    try {
      await deleteTarget(id);
      
      setTargets(prev => prev.filter(target => target.id !== id));
      toast.success("تم حذف المستهدف بنجاح");
    } catch (error) {
      console.error("Error deleting target:", error);
      toast.error("حدث خطأ أثناء حذف المستهدف");
    }
  };

  return {
    handleSubmit,
    handleUpdate,
    handleDelete
  };
}
