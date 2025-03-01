
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FinancialTarget = {
  id: string;
  year: number;
  quarter: number;
  type: string;
  target_amount: number;
  actual_amount: number;
  budget_item_id?: string;
};

type BudgetItem = {
  id: string;
  name: string;
};

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
    budget_item_id: "" as string | undefined,
  });

  useEffect(() => {
    fetchTargets();
    fetchBudgetItems();
  }, []);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("financial_targets")
        .select("*")
        .order("year", { ascending: false })
        .order("quarter", { ascending: true })
        .order("type", { ascending: true });

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("حدث خطأ أثناء جلب المستهدفات المالية");
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from("budget_items")
        .select("id, name");

      if (error) throw error;
      setBudgetItems(data || []);
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
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("financial_targets")
        .insert([{
          year: formData.year,
          quarter: formData.quarter,
          type: formData.type,
          target_amount: formData.target_amount,
          actual_amount: formData.actual_amount,
          budget_item_id: formData.budget_item_id || null,
        }])
        .select();

      if (error) throw error;
      
      setTargets([...(data || []), ...targets]);
      toast.success("تم إضافة المستهدف بنجاح");
      setShowAddForm(false);
      resetForm();
      fetchTargets(); // إعادة تحميل البيانات
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
      const { error } = await supabase
        .from("financial_targets")
        .update({
          year: formData.year,
          quarter: formData.quarter,
          type: formData.type,
          target_amount: formData.target_amount,
          actual_amount: formData.actual_amount,
          budget_item_id: formData.budget_item_id || null,
        })
        .eq("id", editingTarget.id);

      if (error) throw error;
      
      toast.success("تم تحديث المستهدف بنجاح");
      setEditingTarget(null);
      resetForm();
      fetchTargets(); // إعادة تحميل البيانات
    } catch (error) {
      console.error("Error updating target:", error);
      toast.error("حدث خطأ أثناء تحديث المستهدف");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المستهدف؟")) return;
    
    try {
      const { error } = await supabase
        .from("financial_targets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
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

  const getAchievementPercentage = (target: number, actual: number) => {
    if (target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المستهدفات المالية</h2>
        <Button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (editingTarget) {
              cancelEditing();
            }
          }} 
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>إضافة مستهدف جديد</span>
        </Button>
      </div>

      {(showAddForm || editingTarget) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTarget ? "تعديل المستهدف" : "إضافة مستهدف جديد"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">السنة</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarter">الربع</Label>
                  <Select 
                    value={formData.quarter.toString()} 
                    onValueChange={(value) => handleSelectChange("quarter", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الربع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الربع الأول</SelectItem>
                      <SelectItem value="2">الربع الثاني</SelectItem>
                      <SelectItem value="3">الربع الثالث</SelectItem>
                      <SelectItem value="4">الربع الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">النوع</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="موارد">موارد</SelectItem>
                      <SelectItem value="مصروفات">مصروفات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_amount">المبلغ المستهدف</Label>
                  <Input
                    id="target_amount"
                    name="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual_amount">المبلغ المتحقق</Label>
                  <Input
                    id="actual_amount"
                    name="actual_amount"
                    type="number"
                    value={formData.actual_amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_item_id">بند الميزانية (اختياري)</Label>
                  <Select 
                    value={formData.budget_item_id || ""} 
                    onValueChange={(value) => handleSelectChange("budget_item_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر بند الميزانية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون تحديد</SelectItem>
                      {budgetItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                {editingTarget ? (
                  <>
                    <Button type="button" variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4 me-2" />
                      إلغاء
                    </Button>
                    <Button type="button" onClick={handleUpdate}>
                      <Save className="h-4 w-4 me-2" />
                      حفظ التغييرات
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">إضافة المستهدف</Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>المستهدفات المالية</CardTitle>
          <CardDescription>
            عرض المستهدفات المالية وإمكانية مقارنتها بالأرقام المتحققة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">جاري تحميل البيانات...</div>
          ) : targets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">لا توجد مستهدفات مالية مسجلة</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">السنة</TableHead>
                  <TableHead className="text-right">الربع</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المستهدف</TableHead>
                  <TableHead className="text-right">المتحقق</TableHead>
                  <TableHead className="text-right">نسبة التحقيق</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell>{target.year}</TableCell>
                    <TableCell>{target.quarter}</TableCell>
                    <TableCell>{target.type}</TableCell>
                    <TableCell>{target.target_amount.toLocaleString()} ريال</TableCell>
                    <TableCell>{target.actual_amount.toLocaleString()} ريال</TableCell>
                    <TableCell className={getAchievementColor(getAchievementPercentage(target.target_amount, target.actual_amount))}>
                      {getAchievementPercentage(target.target_amount, target.actual_amount)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(target)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
