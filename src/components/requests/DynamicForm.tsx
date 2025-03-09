
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSchema, FormField as FormFieldType } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  isSubmitting?: boolean;
}

export const DynamicForm = ({
  schema,
  onSubmit,
  defaultValues = {},
  isSubmitting = false,
}: DynamicFormProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileUploads, setFileUploads] = useState<Record<string, File | null>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Build zod schema dynamically based on the form schema
  const buildZodSchema = (fields: FormFieldType[]) => {
    const schemaMap: Record<string, any> = {};
    
    fields.forEach((field) => {
      let fieldSchema;
      
      switch (field.type) {
        case "text":
        case "textarea":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `حقل ${field.label} مطلوب`);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "number":
          fieldSchema = z.preprocess(
            (val) => (val === '' ? undefined : Number(val)),
            z.number({ invalid_type_error: `حقل ${field.label} يجب أن يكون رقماً` })
          );
          if (field.required) {
            fieldSchema = fieldSchema.min(0, `يجب أن تكون قيمة ${field.label} أكبر من أو تساوي 0`);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "date":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `حقل ${field.label} مطلوب`);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "select":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, `حقل ${field.label} مطلوب`);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "array":
          if (field.subfields) {
            const subSchemaMap = buildZodSchema(field.subfields);
            const subSchema = z.object(subSchemaMap);
            fieldSchema = z.array(subSchema);
            
            if (field.required) {
              fieldSchema = fieldSchema.min(1, `يجب إضافة عنصر واحد على الأقل في ${field.label}`);
            }
          } else {
            fieldSchema = z.array(z.string());
            if (field.required) {
              fieldSchema = fieldSchema.min(1, `يجب إضافة عنصر واحد على الأقل في ${field.label}`);
            }
          }
          break;
          
        case "file":
          // For file type, we'll store the file URL after upload
          fieldSchema = z.string();
          if (!field.required) {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        default:
          fieldSchema = z.string().optional();
      }
      
      schemaMap[field.name] = fieldSchema;
    });
    
    return schemaMap;
  };

  const formSchema = z.object(buildZodSchema(schema.fields));
  
  // Prepare default values for arrays and complex types
  const prepareDefaultValues = () => {
    const prepared = { ...defaultValues };
    
    schema.fields.forEach((field) => {
      if (field.type === "array" && !prepared[field.name]) {
        prepared[field.name] = [];
      }
    });
    
    return prepared;
  };
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: prepareDefaultValues(),
  });

  const handleSubmit = async (data: any) => {
    try {
      setValidationErrors([]);
      
      // First validate the data
      const errors = validateFormDataTypes(data, schema.fields);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // If there are files to upload, upload them first
      const hasFiles = Object.keys(fileUploads).length > 0;
      if (hasFiles) {
        setIsUploading(true);
        
        // Process all file uploads and collect URLs
        const fileData: Record<string, any> = {};
        
        for (const fieldName in fileUploads) {
          const file = fileUploads[fieldName];
          if (file) {
            try {
              const fileName = `${uuidv4()}-${file.name}`;
              const { error: uploadError, data: uploadData } = await supabase.storage
                .from('request-attachments')
                .upload(fileName, file);
                
              if (uploadError) {
                throw new Error(`فشل في رفع الملف: ${uploadError.message}`);
              }
              
              const { data: { publicUrl } } = supabase.storage
                .from('request-attachments')
                .getPublicUrl(fileName);
                
              fileData[fieldName] = {
                url: publicUrl,
                name: file.name,
                type: file.type
              };
            } catch (error: any) {
              setValidationErrors([`فشل في رفع الملف: ${error.message || 'خطأ غير معروف'}`]);
              setIsUploading(false);
              return;
            }
          }
        }
        
        // Update the form data with file URLs
        for (const fieldName in fileData) {
          data[fieldName] = fileData[fieldName];
        }
        
        setIsUploading(false);
      }
      
      // Now submit the form with file URLs included
      console.log("Form data before submission:", data);
      onSubmit(data);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      setValidationErrors([
        `حدث خطأ أثناء معالجة النموذج: ${error.message || "يرجى التحقق من صحة البيانات المدخلة"}`
      ]);
    }
  };
  
  // Additional validation to ensure data types match schema
  const validateFormDataTypes = (data: any, fields: FormFieldType[]): string[] => {
    const errors: string[] = [];
    
    fields.forEach((field) => {
      const value = data[field.name];
      
      // Skip validation for empty optional fields
      if (!field.required && (value === undefined || value === null || value === '')) {
        return;
      }
      
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`حقل ${field.label} مطلوب`);
        return;
      }
      
      switch (field.type) {
        case "number":
          if (value !== undefined && isNaN(Number(value))) {
            errors.push(`حقل ${field.label} يجب أن يكون رقماً`);
          }
          break;
          
        case "date":
          if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            errors.push(`حقل ${field.label} يجب أن يكون تاريخاً صحيحاً`);
          }
          break;
          
        case "select":
          if (value && field.options && !field.options.includes(value)) {
            errors.push(`قيمة غير صالحة لحقل ${field.label}`);
          }
          break;
          
        case "array":
          if (field.required && (!Array.isArray(value) || value.length === 0)) {
            errors.push(`يجب إضافة عنصر واحد على الأقل في ${field.label}`);
          } else if (Array.isArray(value) && field.subfields) {
            value.forEach((item, index) => {
              field.subfields!.forEach((subfield) => {
                const subfieldValue = item[subfield.name];
                if (subfield.required && (subfieldValue === undefined || subfieldValue === null || subfieldValue === '')) {
                  errors.push(`حقل ${subfield.label} في العنصر ${index + 1} من ${field.label} مطلوب`);
                }
              });
            });
          }
          break;
          
        case "file":
          // Check if a file is selected for required file fields
          if (field.required && !fileUploads[field.name] && !value) {
            errors.push(`الملف مطلوب لحقل ${field.label}`);
          }
          break;
      }
    });
    
    return errors;
  };

  // Handle file change
  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      setFileUploads((prev) => ({ ...prev, [fieldName]: file }));
      
      // Generate a preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFileUrls((prev) => ({ ...prev, [fieldName]: url }));
      }
    }
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      Object.values(fileUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [fileUrls]);

  // Render form fields based on the schema
  const renderFields = (fields: FormFieldType[], parentPath = "") => {
    return fields.map((fieldDef) => {
      const fieldPath = parentPath ? `${parentPath}.${fieldDef.name}` : fieldDef.name;
      
      switch (fieldDef.type) {
        case "text":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`أدخل ${fieldDef.label}`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        case "textarea":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={`أدخل ${fieldDef.label}`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        case "number":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`أدخل ${fieldDef.label}`} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        case "date":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        case "select":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`اختر ${fieldDef.label}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldDef.options?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        case "array":
          return (
            <div key={fieldPath} className="space-y-4">
              <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
              {fieldDef.subfields && (
                <FieldArray
                  name={fieldPath}
                  control={form.control}
                  subfields={fieldDef.subfields}
                />
              )}
            </div>
          );
          
        case "file":
          return (
            <FormField
              key={fieldPath}
              control={form.control}
              name={fieldPath}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldDef.label} {fieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      onChange={(file) => {
                        handleFileChange(fieldDef.name, file);
                        // Set a placeholder value to satisfy form validation
                        field.onChange(file ? file.name : '');
                      }}
                      value={fileUrls[fieldDef.name]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
          
        default:
          return null;
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ في النموذج</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {renderFields(schema.fields)}
        
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading ? "جاري رفع الملفات..." : isSubmitting ? "جاري التقديم..." : "تقديم الطلب"}
        </Button>
      </form>
    </Form>
  );
};

// Component for handling array fields
const FieldArray = ({ 
  name, 
  control, 
  subfields 
}: { 
  name: string; 
  control: any; 
  subfields: FormFieldType[] 
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  // Prepare empty item for adding new array items
  const getEmptyItem = () => {
    return subfields.reduce((acc, subfield) => {
      acc[subfield.name] = subfield.type === "number" ? 0 : "";
      return acc;
    }, {} as Record<string, any>);
  };

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-md space-y-4">
          {subfields.map((subfieldDef) => {
            const fieldName = `${name}.${index}.${subfieldDef.name}`;
            
            switch (subfieldDef.type) {
              case "text":
                return (
                  <FormField
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{subfieldDef.label} {subfieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={`أدخل ${subfieldDef.label}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
                
              case "number":
                return (
                  <FormField
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{subfieldDef.label} {subfieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder={`أدخل ${subfieldDef.label}`} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
                
              case "textarea":
                return (
                  <FormField
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{subfieldDef.label} {subfieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder={`أدخل ${subfieldDef.label}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
                
              case "select":
                return (
                  <FormField
                    key={fieldName}
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{subfieldDef.label} {subfieldDef.required && <span className="text-destructive">*</span>}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`اختر ${subfieldDef.label}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subfieldDef.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
                
              default:
                return null;
            }
          })}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(index)}
          >
            حذف
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append(getEmptyItem())}
      >
        إضافة عنصر جديد
      </Button>
    </div>
  );
};
