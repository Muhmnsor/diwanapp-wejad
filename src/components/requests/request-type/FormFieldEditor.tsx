
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormField } from "../types";
import { requestTypeSchema } from "./schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface FormFieldEditorProps {
  form: UseFormReturn<RequestTypeFormValues>;
}

export const FormFieldEditor = ({ form }: FormFieldEditorProps) => {
  // Initialize with empty array and ensure FormField type
  const [formFields, setFormFields] = useState<FormField[]>(
    form.getValues().form_schema?.fields?.map(field => ({
      name: field.name || "",
      label: field.label || "",
      type: field.type || "text",
      required: field.required ?? false,
      options: field.options || [],
      subfields: field.subfields || [],
    })) || []
  );

  const [currentField, setCurrentField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: []
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentOption, setCurrentOption] = useState("");

  const resetFieldForm = () => {
    setCurrentField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: []
    });
    setEditingFieldIndex(null);
    setCurrentOption("");
  };

  const handleAddField = () => {
    if (!currentField.name || !currentField.label) {
      return;
    }

    const formattedName = currentField.name.replace(/\s+/g, "_").toLowerCase();
    
    const newField: FormField = {
      ...currentField,
      name: formattedName,
    };

    // If type is array and there are no subfields defined, initialize with empty array
    if (newField.type === 'array' && !newField.subfields) {
      newField.subfields = [];
    }

    const updatedFields = [...formFields];

    if (editingFieldIndex !== null) {
      updatedFields[editingFieldIndex] = newField;
    } else {
      updatedFields.push(newField);
    }

    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
    resetFieldForm();
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
  };

  const handleEditField = (index: number) => {
    setCurrentField(formFields[index]);
    setEditingFieldIndex(index);
  };

  const handleAddOption = () => {
    if (!currentOption) return;
    
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: [...options, currentOption],
    });
    setCurrentOption("");
  };

  const handleRemoveOption = (index: number) => {
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">نموذج البيانات</h3>
      <p className="text-sm text-muted-foreground">
        قم بتحديد الحقول المطلوبة في نموذج الطلب
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex items-center space-x-2">
            <Switch
              id="field-required"
              checked={currentField.required}
              onCheckedChange={(checked) => setCurrentField({ ...currentField, required: checked })}
            />
            <label htmlFor="field-required" className="text-sm font-medium mr-2">مطلوب</label>
          </div>

          {currentField.type === 'select' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">قيم القائمة المنسدلة</label>
              
              <div className="flex space-x-2">
                <Input
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  placeholder="أضف قيمة جديدة"
                  className="flex-1 ml-2"
                />
                <Button type="button" size="sm" onClick={handleAddOption}>إضافة</Button>
              </div>

              <div className="space-y-2 mt-2">
                {currentField.options && currentField.options.map((option, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span>{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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

        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-2">الحقول المضافة</h4>
          {formFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">لم يتم إضافة أي حقول بعد</p>
          ) : (
            <div className="space-y-2">
              {formFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <div>
                    <span className="font-medium">{field.label}</span>
                    <span className="mx-2 text-muted-foreground">({field.name})</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{field.type}</span>
                    {field.required && (
                      <span className="text-xs bg-red-100 text-red-800 mx-1 px-2 py-0.5 rounded">مطلوب</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditField(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Separator />
    </div>
  );
};
