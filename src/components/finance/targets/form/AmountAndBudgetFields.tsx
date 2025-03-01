
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetItem } from "../TargetsDataService";
import { TargetFormData } from "../hooks/useTargetFormState";

interface AmountAndBudgetFieldsProps {
  formData: TargetFormData;
  budgetItems: BudgetItem[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export const AmountAndBudgetFields: React.FC<AmountAndBudgetFieldsProps> = ({
  formData,
  budgetItems,
  handleInputChange,
  handleSelectChange,
}) => {
  return (
    <>
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
    </>
  );
};
