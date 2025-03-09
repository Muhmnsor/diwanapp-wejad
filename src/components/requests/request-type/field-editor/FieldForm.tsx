
import React from "react";
import { FormField } from "../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { SelectOptionsSection } from "./SelectOptionsSection";
import { RequiredSwitch } from "./RequiredSwitch";

interface FieldFormProps {
  currentField: FormField;
  setCurrentField: (field: FormField) => void;
  handleAddField: () => void;
  editingFieldIndex: number | null;
  currentOption: string;
  setCurrentOption: (option: string) => void;
  handleAddOption: () => void;
  handleRemoveOption: (index: number) => void;
}

export const FieldForm = ({
  currentField,
  setCurrentField,
  handleAddField,
  editingFieldIndex,
  currentOption,
  setCurrentOption,
  handleAddOption,
  handleRemoveOption
}: FieldFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="field-name" className="text-sm font-medium">اسم الحقل</label>
        <Input
          id="field-name"
          value={currentField.name}
          onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
          placeholder="مثال: اسم_المشروع"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="field-label" className="text-sm font-medium">عنوان الحقل</label>
        <Input
          id="field-label"
          value={currentField.label}
          onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
          placeholder="مثال: اسم المشروع"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="field-type" className="text-sm font-medium">نوع الحقل</label>
        <Select
          value={currentField.type}
          onValueChange={(value: any) => setCurrentField({ ...currentField, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الحقل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">نص</SelectItem>
            <SelectItem value="textarea">نص متعدد الأسطر</SelectItem>
            <SelectItem value="number">رقم</SelectItem>
            <SelectItem value="date">تاريخ</SelectItem>
            <SelectItem value="select">قائمة منسدلة</SelectItem>
            <SelectItem value="array">مصفوفة</SelectItem>
            <SelectItem value="file">ملف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RequiredSwitch 
        isRequired={currentField.required} 
        onChange={(checked) => setCurrentField({ ...currentField, required: checked })} 
      />

      {currentField.type === 'select' && (
        <SelectOptionsSection
          options={currentField.options || []}
          currentOption={currentOption}
          setCurrentOption={setCurrentOption}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
        />
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleAddField}
        >
          {editingFieldIndex !== null ? 'تحديث الحقل' : 'إضافة حقل'}
        </Button>
      </div>
    </div>
  );
};
