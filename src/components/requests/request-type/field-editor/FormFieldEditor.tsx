
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "../schema";
import { useFormFieldEditor } from "./useFormFieldEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface FormFieldEditorProps {
  form: UseFormReturn<RequestTypeFormValues>;
}

export const FieldEditor = ({ form }: FormFieldEditorProps) => {
  // Safely initialize the hook with error handling
  try {
    const {
      formFields,
      currentField,
      setCurrentField,
      editingFieldIndex,
      currentOption,
      setCurrentOption,
      handleAddField,
      handleRemoveField,
      handleEditField,
      handleAddOption,
      handleRemoveOption
    } = useFormFieldEditor(form);

    return (
      <div className="space-y-6 p-4 border rounded-md">
        <h3 className="text-lg font-medium">حقول النموذج</h3>

        {/* Field list */}
        {formFields.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">الحقول المضافة:</h4>
            <div className="grid gap-2">
              {formFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <span className="font-semibold">{field.label}</span>
                    <span className="text-muted-foreground mx-2">({field.type})</span>
                    {field.required && <span className="text-red-500 text-sm">*</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditField(index)}
                    >
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveField(index)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground">لم يتم إضافة حقول بعد</p>
          </div>
        )}

        {/* Add/Edit field form */}
        <div className="border p-4 rounded-md">
          <h4 className="font-medium mb-4">
            {editingFieldIndex !== null ? "تعديل الحقل" : "إضافة حقل جديد"}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">عنوان الحقل</Label>
                <Input
                  id="field-label"
                  value={currentField.label}
                  onChange={(e) =>
                    setCurrentField({ ...currentField, label: e.target.value })
                  }
                  placeholder="مثال: الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-name">اسم الحقل (تلقائي)</Label>
                <Input
                  id="field-name"
                  value={currentField.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-type">نوع الحقل</Label>
                <Select
                  value={currentField.type}
                  onValueChange={(value) =>
                    setCurrentField({
                      ...currentField,
                      type: value as any,
                      options: value === "select" || value === "radio" ? [] : undefined,
                    })
                  }
                >
                  <SelectTrigger id="field-type">
                    <SelectValue placeholder="اختر نوع الحقل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص</SelectItem>
                    <SelectItem value="textarea">نص طويل</SelectItem>
                    <SelectItem value="number">رقم</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="date">تاريخ</SelectItem>
                    <SelectItem value="checkbox">مربع اختيار</SelectItem>
                    <SelectItem value="select">قائمة منسدلة</SelectItem>
                    <SelectItem value="radio">اختيار من متعدد</SelectItem>
                    <SelectItem value="file">ملف</SelectItem>
                    <SelectItem value="array">مجموعة عناصر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="field-required"
                    checked={currentField.required}
                    onCheckedChange={(checked) =>
                      setCurrentField({
                        ...currentField,
                        required: Boolean(checked),
                      })
                    }
                  />
                  <Label htmlFor="field-required">حقل مطلوب</Label>
                </div>
              </div>
            </div>

            {/* Options for select/radio fields */}
            {(currentField.type === "select" || currentField.type === "radio") && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium">خيارات الحقل</h5>
                
                {/* Current options */}
                {currentField.options && currentField.options.length > 0 ? (
                  <div className="space-y-2">
                    {currentField.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={option} readOnly className="bg-muted" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">لا توجد خيارات بعد</p>
                )}

                {/* Add new option */}
                <div className="flex gap-2">
                  <Input
                    value={currentOption}
                    onChange={(e) => setCurrentOption(e.target.value)}
                    placeholder="أدخل خيار جديد"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddOption}
                    disabled={!currentOption}
                  >
                    إضافة
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {editingFieldIndex !== null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentField({
                      name: "",
                      label: "",
                      type: "text",
                      required: false,
                      options: []
                    });
                    setCurrentOption("");
                  }}
                >
                  إلغاء
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddField}
                disabled={!currentField.label}
              >
                {editingFieldIndex !== null ? "تحديث الحقل" : "إضافة الحقل"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in FieldEditor:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في محرر الحقول. يرجى تحديث الصفحة والمحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }
};
