
import React, { useState } from "react";
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
import { AlertCircle, Plus, Trash } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

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
            const subSchemaMap: Record<string, any> = {};
            field.subfields.forEach(subfield => {
              if (subfield.required) {
                subSchemaMap[subfield.name] = z.string().min(1, `حقل ${subfield.label} مطلوب`);
              } else {
                subSchemaMap[subfield.name] = z.string().optional();
              }
            });
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
          fieldSchema = z.any(); // File handling would need more specific validation
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

  const formSchema = z.object(buildZodSchema(schema.fields || []));
  
  // Prepare default values for arrays and complex types
  const prepareDefaultValues = () => {
    const prepared = { ...defaultValues };
    
    (schema.fields || []).forEach((field) => {
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

  const handleSubmit = (data: any) => {
    try {
      console.log("Form data before submission:", data);
      
      // Additional validation to ensure all data conforms to expected types
      const errors = validateFormDataTypes(data, schema.fields || []);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      setValidationErrors([]);
      onSubmit(data);
    } catch (error) {
      console.error("Error in form submission:", error);
      setValidationErrors([
        "حدث خطأ أثناء معالجة النموذج. يرجى التحقق من صحة البيانات المدخلة."
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
          if (field.options && value && !field.options.some(opt => 
              typeof opt === 'string' ? opt === value : 
              (opt.value === value || opt.label === value)
            )) {
            errors.push(`قيمة "${value}" غير صالحة لحقل "${field.label}"`);
          }
          break;
          
        case "array":
          if (!Array.isArray(value)) {
            errors.push(`حقل "${field.label}" يجب أن يكون قائمة`);
          } else if (field.required && value.length === 0) {
            errors.push(`حقل "${field.label}" يجب أن يحتوي على عنصر واحد على الأقل`);
          } else if (field.subfields && Array.isArray(value)) {
            // Validate each item in the array
            value.forEach((item, index) => {
              field.subfields?.forEach((subfield) => {
                const subfieldValue = item[subfield.name];
                if (subfield.required && (subfieldValue === undefined || subfieldValue === null || subfieldValue === '')) {
                  errors.push(`حقل "${subfield.label}" في العنصر ${index + 1} من "${field.label}" مطلوب`);
                }
              });
            });
          }
          break;
      }
    });
    
    return errors;
  };

  // Render a single form field based on its type
  const renderField = (field: FormFieldType) => {
    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder={field.placeholder || ""} {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Textarea placeholder={field.placeholder || ""} {...formField} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={field.placeholder || ""} 
                    {...formField}
                    onChange={(e) => {
                      const value = e.target.value;
                      formField.onChange(value === "" ? "" : Number(value));
                    }}
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
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Input type="date" {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "اختر..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(field.options || []).map((option) => {
                      // Handle both string options and {label, value} objects
                      const value = typeof option === 'string' ? option : option.value;
                      const label = typeof option === 'string' ? option : option.label;
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case "array":
        if (!field.subfields || field.subfields.length === 0) {
          return null;
        }
        
        return (
          <div key={field.name} className="mb-4">
            <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
            <div className="mt-2">
              {form.watch(field.name)?.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {form.watch(field.name)?.map((_, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 h-8 w-8 text-destructive"
                          onClick={() => {
                            const currentItems = form.getValues(field.name) as any[];
                            const newItems = currentItems.filter((_, i) => i !== index);
                            form.setValue(field.name, newItems);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {field.subfields?.map((subfield) => (
                            <FormField
                              key={`${field.name}.${index}.${subfield.name}`}
                              control={form.control}
                              name={`${field.name}.${index}.${subfield.name}`}
                              render={({ field: subFormField }) => (
                                <FormItem>
                                  <FormLabel>{subfield.label} {subfield.required && <span className="text-destructive">*</span>}</FormLabel>
                                  <FormControl>
                                    <Input {...subFormField} placeholder={subfield.placeholder || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentItems = form.getValues(field.name) as any[];
                  const newItem = field.subfields?.reduce(
                    (acc, subfield) => ({ ...acc, [subfield.name]: "" }),
                    {}
                  );
                  form.setValue(field.name, [...(currentItems || []), newItem]);
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                إضافة {field.label}
              </Button>
            </div>
            <FormMessage>{form.formState.errors[field.name]?.message as string}</FormMessage>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ في النموذج</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {(schema.fields || []).map((field) => renderField(field))}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "جاري إرسال الطلب..." : "إرسال الطلب"}
        </Button>
      </form>
    </Form>
  );
};
