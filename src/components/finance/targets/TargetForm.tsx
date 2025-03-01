
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

type BudgetItem = {
  id: string;
  name: string;
};

type FinancialTarget = {
  id: string;
  year: number;
  quarter: number;
  type: string;
  target_amount: number;
  actual_amount: number;
  budget_item_id?: string;
};

type TargetFormProps = {
  budgetItems: BudgetItem[];
  editingTarget: FinancialTarget | null;
  onSubmit: (e: React.FormEvent) => void;
  onUpdate: () => void;
  onCancel: () => void;
  formData: {
    year: number;
    quarter: number;
    type: string;
    target_amount: number;
    actual_amount: number;
    budget_item_id?: string;
  };
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingTarget ? "تعديل المستهدف" : "إضافة مستهدف جديد"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
                value={formData.budget_item_id || "none"} 
                onValueChange={(value) => handleSelectChange("budget_item_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر بند الميزانية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تحديد</SelectItem>
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
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 me-2" />
                  إلغاء
                </Button>
                <Button type="button" onClick={onUpdate}>
                  <Save className="h-4 w-4 me-2" />
                  حفظ التغييرات
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onCancel}>
                  إلغاء
                </Button>
                <Button type="submit">إضافة المستهدف</Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
