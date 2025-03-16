import React, { useState } from "react";
import { FormField } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface FormFieldEditorProps {
  currentField: FormField;
  editingFieldIndex: number | null;
  setCurrentField: (field: FormField) => void;
  handleAddField: () => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  currentField,
  editingFieldIndex,
  setCurrentField,
  handleAddField,
}) => {
  const [currentOption, setCurrentOption] = useState("");

  const handleAddOption = () => {
    if (!currentOption) return;
    
    const options = currentField.options || [];
    
    // Create a proper option object
    const newOption = {
      label: currentOption,
      value: currentOption.toLowerCase().replace(/\s+/g, '_')
    };
    
    setCurrentField({
      ...currentField,
      options: [...options, newOption],
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
    <Card>
      <CardHeader className="pb-3">
        <h4 className="text-sm font-medium">إضافة حقل جديد</h4>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم الحقل</label>
            <Input
              placeholder="اسم الحقل (بدون مسافات)"
              value={currentField.name}
              onChange={(e) => {
                // Format field name: lowercase, replace spaces with underscores
                const formattedName = e.target.value.toLowerCase().replace(/\s+/g, '_');
                setCurrentField({ 
                  ...currentField, 
                  name: formattedName
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">عنوان الحقل</label>
            <Input
              placeholder="العنوان الظاهر للمستخدم"
              value={currentField.label}
              onChange={(e) =>
                setCurrentField({ 
                  ...currentField, 
                  label: e.target.value
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع الحقل</label>
            <Select
              value={currentField.type}
              onValueChange={(value: "text" | "textarea" | "number" | "date" | "select" | "array" | "file") => {
                // Reset options if changing from select to another type
                const newField = { 
                  ...currentField, 
                  type: value,
                  // Clear options if not a select field
                  ...(value !== 'select' ? { options: [] } : {})
                };
                setCurrentField(newField);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحقل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">نص</SelectItem>
                <SelectItem value="textarea">نص طويل</SelectItem>
                <SelectItem value="number">رقم</SelectItem>
                <SelectItem value="date">تاريخ</SelectItem>
                <SelectItem value="select">قائمة اختيار</SelectItem>
                <SelectItem value="file">ملف مرفق</SelectItem>
                <SelectItem value="array">قائمة عناصر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="required-field"
                checked={currentField.required}
                onCheckedChange={(checked) =>
                  setCurrentField({ ...currentField, required: checked })
                }
              />
              <label
                htmlFor="required-field"
                className="text-sm font-medium"
              >
                حقل مطلوب
              </label>
            </div>
          </div>
        </div>

        {currentField.type === "select" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">خيارات القائمة</label>
            <div className="flex space-x-2 space-x-reverse">
              <Input
                placeholder="أدخل خياراً"
                value={currentOption}
                onChange={(e) => setCurrentOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 pt-2">
              {(currentField.options || []).map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-2 rounded-md"
                >
                  <span>{typeof option === 'string' ? option : option.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={() => {
            // Basic validation
            if (!currentField.name || !currentField.label) {
              toast.error('اسم الحقل وعنوانه مطلوبان');
              return;
            }
            
            // If select type, ensure there are options
            if (currentField.type === 'select' && (!currentField.options || currentField.options.length === 0)) {
              toast.error('يجب إضافة خيار واحد على الأقل لقائمة الاختيار');
              return;
            }
            
            // Ensure the field has an ID
            if (!currentField.id) {
              setCurrentField({
                ...currentField,
                id: uuidv4()
              });
            }
            
            handleAddField();
          }}
          className="mr-auto"
        >
          {editingFieldIndex !== null ? "تحديث الحقل" : "إضافة الحقل"}
        </Button>
      </CardFooter>
    </Card>
  );
};
