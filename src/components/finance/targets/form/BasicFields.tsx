
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
        <Label htmlFor="quarter">الفترة</Label>
        <Select
          value={formData.quarter.toString()}
          onValueChange={(value) => handleSelectChange("quarter", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">سنوي</SelectItem>
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
    </>
  );
};
