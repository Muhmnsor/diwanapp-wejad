
import { useFormBuilder } from "../FormBuilderContext";
import { DynamicField } from "@/types/form-builder";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

export const DynamicFormDisplay = () => {
  const { formState } = useFormBuilder();
  const { currentForm } = formState;
  const { fields, title, description } = currentForm;

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues({
      ...formValues,
      [fieldId]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form values:", formValues);
    setSubmitted(true);
    
    // في حالة التطبيق الفعلي، هنا سيتم إرسال البيانات إلى الخادم
    setTimeout(() => {
      setSubmitted(false);
      setFormValues({});
    }, 3000);
  };

  // رندر كل حقل حسب نوعه
  const renderFormField = (field: DynamicField) => {
    const { id, type, label, placeholder, required, options, description, config } = field;
    const value = formValues[id] || "";
    
    // الاسم الذي سيظهر للحقل المطلوب
    const fieldLabel = (
      <div className="flex">
        <span>{label}</span>
        {required && <span className="text-red-500 mr-1">*</span>}
      </div>
    );

    switch (type) {
      case "text":
      case "phone":
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type={type === "number" ? "number" : "text"}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              required={required}
            />
          </div>
        );
        
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Textarea
              id={id}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              required={required}
              rows={4}
            />
          </div>
        );
        
      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              required={required}
            />
          </div>
        );
        
      case "dropdown":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(id, val)}
            >
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
          </div>
        );
        
      case "radio":
        return (
          <div className="space-y-2">
            <Label>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <RadioGroup
              value={value}
              onValueChange={(val) => handleFieldChange(id, val)}
            >
              <div className="space-y-2">
                {options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                    <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
        
      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <Label>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="space-y-2">
              {options?.map((option, idx) => {
                const isChecked = checkboxValues.includes(option.value);
                return (
                  <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`${id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...checkboxValues, option.value]
                          : checkboxValues.filter((val) => val !== option.value);
                        handleFieldChange(id, newValues);
                      }}
                    />
                    <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case "file":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{fieldLabel}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                اضغط هنا لتحميل ملف أو اسحب الملف وأفلته هنا
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {config?.allowedFileTypes?.join(", ")} - أقصى حجم {config?.maxFileSize}MB
              </p>
              <input
                id={id}
                type="file"
                className="hidden"
                required={required}
                onChange={(e) => handleFieldChange(id, e.target.files?.[0] || null)}
              />
            </div>
          </div>
        );
        
      case "section":
        return (
          <div className="border-b pb-2 mb-4">
            <h3 className="text-lg font-semibold">{label}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
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
        
      default:
        return <div>نوع حقل غير مدعوم: {type}</div>;
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-medium">تم إرسال النموذج بنجاح!</h3>
          <p className="text-muted-foreground mt-2">تم استلام بياناتك بنجاح.</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setFormValues({});
            }}
          >
            إغلاق
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" dir="rtl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          
          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                {renderFormField(field)}
              </div>
            ))}
          </div>
          
          <Button type="submit" className="w-full">
            إرسال
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
