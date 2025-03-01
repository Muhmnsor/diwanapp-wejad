
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TargetsHeader } from "./targets/TargetsHeader";
import { TargetForm } from "./targets/TargetForm";
import { TargetsContainer } from "./targets/TargetsContainer";
import { 
  FinancialTarget, 
  BudgetItem, 
  fetchTargets, 
  fetchBudgetItems, 
  addTarget, 
  updateTarget, 
  deleteTarget, 
  updateActualAmounts 
} from "./targets/TargetsDataService";

export const TargetsTab = () => {
  const [targets, setTargets] = useState<FinancialTarget[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<FinancialTarget | null>(null);
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    quarter: 1,
    type: "موارد",
    target_amount: 0,
    actual_amount: 0,
    budget_item_id: undefined as string | undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTargets(),
        loadBudgetItems()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const targetsData = await fetchTargets();
      
      // بعد جلب المستهدفات، نحدّث القيم المتحققة من قاعدة البيانات
      if (targetsData.length > 0) {
        const updatedTargets = await updateActualAmounts(targetsData);
        setTargets(updatedTargets);
      } else {
        setTargets([]);
      }
    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("حدث خطأ أثناء جلب المستهدفات المالية");
    }
  };

  const loadBudgetItems = async () => {
    try {
      const items = await fetchBudgetItems();
      setBudgetItems(items);
    } catch (error) {
      console.error("Error fetching budget items:", error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTarget({
        year: formData.year,
        quarter: formData.quarter,
        type: formData.type,
        target_amount: formData.target_amount,
        actual_amount: formData.actual_amount,
        budget_item_id: formData.budget_item_id,
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

  const handleEdit = (target: FinancialTarget) => {
    setEditingTarget(target);
    setFormData({
      year: target.year,
      quarter: target.quarter,
      type: target.type,
      target_amount: target.target_amount,
      actual_amount: target.actual_amount,
      budget_item_id: target.budget_item_id,
    });
  };

  const handleUpdate = async () => {
    if (!editingTarget) return;
    
    try {
      await updateTarget(editingTarget.id, {
        year: formData.year,
        quarter: formData.quarter,
        type: formData.type,
        target_amount: formData.target_amount,
        actual_amount: formData.actual_amount,
        budget_item_id: formData.budget_item_id,
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
      
      setTargets(targets.filter(target => target.id !== id));
      toast.success("تم حذف المستهدف بنجاح");
    } catch (error) {
      console.error("Error deleting target:", error);
      toast.error("حدث خطأ أثناء حذف المستهدف");
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      quarter: 1,
      type: "موارد",
      target_amount: 0,
      actual_amount: 0,
      budget_item_id: undefined,
    });
  };

  const cancelEditing = () => {
    setEditingTarget(null);
    resetForm();
  };
  
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (editingTarget) {
      cancelEditing();
    }
  };

  return (
    <div className="space-y-6">
      <TargetsHeader onAddNew={toggleAddForm} />

      {(showAddForm || editingTarget) && (
        <TargetForm
          budgetItems={budgetItems}
          editingTarget={editingTarget}
          onSubmit={handleSubmit}
          onUpdate={handleUpdate}
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
