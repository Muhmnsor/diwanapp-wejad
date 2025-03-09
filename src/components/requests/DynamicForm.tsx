
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
            fieldSchema = fieldSchema.min(1, "هذا الحقل مطلوب");
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "number":
          fieldSchema = z.coerce.number();
          if (field.required) {
            fieldSchema = fieldSchema.min(0, "يجب أن تكون القيمة أكبر من أو تساوي 0");
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "date":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, "هذا الحقل مطلوب");
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
          
        case "select":
          fieldSchema = z.string();
          if (field.required) {
            fieldSchema = fieldSchema.min(1, "هذا الحقل مطلوب");
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
              fieldSchema = fieldSchema.min(1, "يجب إضافة عنصر واحد على الأقل");
            }
          } else {
            fieldSchema = z.array(z.string());
            if (field.required) {
              fieldSchema = fieldSchema.min(1, "يجب إضافة عنصر واحد على الأقل");
            }
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
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

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
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <FormLabel>{fieldDef.label}</FormLabel>
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
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر قيمة" />
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
              <FormLabel>{fieldDef.label}</FormLabel>
              {fieldDef.subfields && (
                <FieldArray
                  name={fieldPath}
                  control={form.control}
                  subfields={fieldDef.subfields}
                />
              )}
            </div>
          );
          
        default:
          return null;
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderFields(schema.fields)}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري التقديم..." : "تقديم الطلب"}
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
                        <FormLabel>{subfieldDef.label}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{subfieldDef.label}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
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
        onClick={() => {
          const newItem = subfields.reduce((acc, subfield) => {
            acc[subfield.name] = "";
            return acc;
          }, {} as Record<string, string>);
          append(newItem);
        }}
      >
        إضافة عنصر جديد
      </Button>
    </div>
  );
};
