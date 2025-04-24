
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AddFieldButton } from "./AddFieldButton";
import { useFormBuilder } from "../FormBuilderContext";
import { DynamicFieldType } from "@/types/form-builder";

const FIELD_GROUPS = [
  {
    title: "الحقول الأساسية",
    fields: [
      { type: "text", label: "حقل نص", icon: "text-cursor" },
      { type: "textarea", label: "نص طويل", icon: "file-text" },
      { type: "number", label: "رقم", icon: "hash" },
      { type: "date", label: "تاريخ", icon: "calendar" },
      { type: "phone", label: "رقم هاتف", icon: "phone" }
    ]
  },
  {
    title: "حقول الاختيار",
    fields: [
      { type: "dropdown", label: "قائمة منسدلة", icon: "list" },
      { type: "radio", label: "اختيار واحد", icon: "circle" },
      { type: "checkbox", label: "مربعات اختيار", icon: "square-check" },
      { type: "multiselect", label: "اختيار متعدد", icon: "list-check" }
    ]
  },
  {
    title: "عناصر إضافية",
    fields: [
      { type: "file", label: "رفع ملف", icon: "upload" },
      { type: "section", label: "قسم / عنوان", icon: "heading" },
      { type: "alert", label: "رسالة تنبيه", icon: "alert-triangle" },
      { type: "rating", label: "تقييم", icon: "star" }
    ]
  }
];

export const FormBuilderToolbar = () => {
  const { addField } = useFormBuilder();

  const handleAddField = (type: DynamicFieldType) => {
    const defaultFieldData = {
      type,
      label: getDefaultLabel(type),
      required: false,
      placeholder: "",
    };
    
    // إضافة إعدادات إضافية حسب نوع الحقل
    switch (type) {
      case "dropdown":
      case "radio":
      case "checkbox":
      case "multiselect":
        defaultFieldData["options"] = [
          { label: "خيار 1", value: "option1" },
          { label: "خيار 2", value: "option2" }
        ];
        break;
      case "alert":
        defaultFieldData["config"] = { alertType: "info" };
        break;
      case "file":
        defaultFieldData["config"] = {
          maxFileSize: 5, // ميجابايت
          allowedFileTypes: ["image/*", "application/pdf"]
        };
        break;
      case "section":
        defaultFieldData["description"] = "وصف القسم";
        break;
    }

    addField(defaultFieldData);
  };

  const getDefaultLabel = (type: DynamicFieldType): string => {
    const labels: Record<DynamicFieldType, string> = {
      text: "حقل نصي",
      textarea: "نص طويل",
      number: "حقل رقمي",
      dropdown: "قائمة منسدلة",
      radio: "اختيار واحد",
      checkbox: "مربع اختيار",
      file: "رفع ملف",
      date: "تاريخ",
      multiselect: "اختيار متعدد",
      alert: "تنبيه هام",
      section: "عنوان القسم",
      rating: "تقييم",
      phone: "رقم الهاتف"
    };
    
    return labels[type] || "حقل جديد";
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h3 className="font-semibold">العناصر المتاحة</h3>
      
      <div className="space-y-6">
        {FIELD_GROUPS.map((group, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {group.title}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {group.fields.map((field) => (
                <AddFieldButton
                  key={field.type}
                  label={field.label}
                  icon={field.icon}
                  onClick={() => handleAddField(field.type as DynamicFieldType)}
                />
              ))}
            </div>
            
            {index < FIELD_GROUPS.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </div>

      <Card className="bg-primary/5 border-dashed">
        <CardContent className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => addField({
              type: "text",
              label: "حقل مخصص",
              required: false
            })}
          >
            <Plus className="h-4 w-4 ml-2" />
            <span>إضافة حقل مخصص</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
