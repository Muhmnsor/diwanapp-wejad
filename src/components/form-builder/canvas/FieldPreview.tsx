
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicField } from "@/types/form-builder";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useFormBuilder } from "../FormBuilderContext";

interface FieldPreviewProps {
  field: DynamicField;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (field: DynamicField) => void;
  index: number;
}

export const FieldPreview = ({
  field,
  isSelected,
  onClick,
  onUpdate,
  index,
}: FieldPreviewProps) => {
  const { removeField, moveFieldUp, moveFieldDown } = useFormBuilder();

  // رندر حقول مختلفة استنادًا إلى نوع الحقل
  const renderFieldPreview = () => {
    const { type, label, placeholder, required, options, config } = field;

    switch (type) {
      case "text":
        return (
          <Input
            placeholder={placeholder || `أدخل ${label}`}
            disabled
          />
        );
        
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder || `أدخل ${label}`}
            disabled
            rows={3}
          />
        );
        
      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder || "0"}
            disabled
          />
        );
        
      case "date":
        return (
          <Input
            type="date"
            disabled
          />
        );
        
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || "اختر..."} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option, idx) => (
                <SelectItem key={idx} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case "radio":
        return (
          <RadioGroup disabled defaultValue={options?.[0]?.value}>
            <div className="space-y-2">
              {options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
        
      case "checkbox":
        return (
          <div className="space-y-2">
            {options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox id={`${field.id}-${option.value}`} disabled />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );
        
      case "file":
        return (
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              اضغط هنا لتحميل ملف أو اسحب الملف وأفلته هنا
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {config?.allowedFileTypes?.join(", ")} - أقصى حجم {config?.maxFileSize}MB
            </p>
          </div>
        );
        
      case "section":
        return (
          <div>
            <h3 className="text-lg font-semibold">{label}</h3>
            {field.description && (
              <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
            )}
          </div>
        );
        
      case "alert":
        const alertType = config?.alertType || "info";
        const AlertIcon = {
          info: Info,
          warning: AlertTriangle,
          error: AlertCircle,
          success: CheckCircle2,
        }[alertType];
        
        return (
          <Alert variant={alertType === "info" ? "default" : alertType as any}>
            {AlertIcon && <AlertIcon className="h-4 w-4" />}
            <AlertDescription>{label}</AlertDescription>
          </Alert>
        );
        
      case "multiselect":
        return (
          <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-background">
            {options?.slice(0, 2).map((option, idx) => (
              <Badge key={idx} variant="secondary" className="bg-muted">{option.label}</Badge>
            ))}
            <Badge variant="outline" className="bg-primary/5">+ اختيار المزيد</Badge>
          </div>
        );
        
      default:
        return <Input disabled placeholder="حقل غير معروف" />;
    }
  };

  // من أجل عرض حقول الإدخال في مود المعاينة
  return (
    <Card 
      className={`transition-all ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Label>{field.label}</Label>
              {field.required && <Badge variant="destructive">مطلوب</Badge>}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        </div>
        
        <div className="pt-2">
          {renderFieldPreview()}
        </div>
      </CardContent>
    </Card>
  );
};
