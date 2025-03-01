
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TargetFormData } from "../hooks/useTargetFormState";

interface BasicFieldsProps {
  formData: TargetFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export const BasicFields: React.FC<BasicFieldsProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
}) => {
  return (
    <>
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
        <Label htmlFor="period_type">نوع الفترة</Label>
        <Select
          value={formData.period_type}
          onValueChange={(value) => handleSelectChange("period_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yearly">سنوي</SelectItem>
            <SelectItem value="quarterly">ربع سنوي</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.period_type === "quarterly" && (
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
      )}
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
    </>
  );
};
