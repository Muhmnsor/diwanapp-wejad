
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateFormData } from "./utils/formValidator";

interface DynamicFormProps {
  schema: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  onBack?: () => void;
  showSuccess?: boolean;
}

export const DynamicForm = ({ 
  schema, 
  onSubmit, 
  isSubmitting = false,
  onBack,
  showSuccess = false
}: DynamicFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Clear success message when form changes
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setSuccess(null);
    }
  }, [formData, touched]);

  // Set success message when showSuccess prop changes
  useEffect(() => {
    if (showSuccess) {
      setSuccess("تم إرسال البيانات بنجاح وحفظها في قاعدة البيانات");
    }
  }, [showSuccess]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Clear any errors for this field
    setErrors(errors.filter(error => !error.includes(name)));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      // Simple client-side validation for file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors([...errors, `حجم الملف ${file.name} يتجاوز الحد المسموح به (10 ميجابايت)`]);
        return;
      }

      setUploadingFiles({ ...uploadingFiles, [name]: true });
      
      // Set the File object directly in formData
      handleChange(name, file);
      
      // Clear uploading state after a short delay (for UI feedback)
      setTimeout(() => {
        setUploadingFiles(prev => ({ ...prev, [name]: false }));
      }, 1000);
    } else {
      handleChange(name, null);
    }
  };

  const validateForm = (): boolean => {
    // Use the imported validation function
    const validationResult = validateFormData(formData, schema);
    setErrors(validationResult.errors);
    return validationResult.valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Only call onSubmit if validation passed
      onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        setErrors([...errors, error.message]);
      } else {
        setErrors([...errors, "حدث خطأ أثناء إرسال البيانات"]);
      }
    }
  };

  const renderField = (field: any) => {
    const { type, name, label, required, placeholder, options, description } = field;
    const value = formData[name] || '';
    
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleChange(name, e.target.value)}
              required={required}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={name}
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={(e) => handleChange(name, e.target.value)}
              required={required}
              rows={4}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(value) => handleChange(name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder || "اختر قيمة"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id={name}
                name={name}
                type="file"
                onChange={(e) => handleFileChange(name, e.target.files?.[0] || null)}
                required={required}
                className="rtl:space-x-reverse"
              />
              {uploadingFiles[name] && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {formData[name] instanceof File && !uploadingFiles[name] && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <p className="text-xs text-muted-foreground">
              الحد الأقصى لحجم الملف: 10 ميجابايت
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="my-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {schema?.fields?.map((field: any) => renderField(field))}
      
      <div className="flex justify-between">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            رجوع
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || Object.values(uploadingFiles).some(v => v)}
          className="mr-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            "إرسال"
          )}
        </Button>
      </div>
    </form>
  );
};
