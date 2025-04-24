
import { useFormBuilder } from "../FormBuilderContext";
import { FieldPreview } from "./FieldPreview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@dnd-kit/core';

export const FormBuilderCanvas = () => {
  const { 
    formState, 
    updateFormDetails, 
    selectField,
    updateField
  } = useFormBuilder();
  
  const { currentForm, selectedFieldIndex } = formState;
  const { fields, title, description } = currentForm;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="space-y-4">
        <div>
          <Input
            value={title}
            onChange={(e) => updateFormDetails(e.target.value, description)}
            className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 px-0 text-right"
            placeholder="عنوان النموذج"
          />
        </div>
        
        <div>
          <Textarea
            value={description || ""}
            onChange={(e) => updateFormDetails(title, e.target.value)}
            className="resize-none border-none bg-transparent focus-visible:ring-0 px-0 text-right"
            placeholder="وصف النموذج (اختياري)"
          />
        </div>
      </div>
      
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md py-12 px-6 text-muted-foreground">
          <Info className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">لم يتم إضافة حقول بعد</h3>
          <p className="text-sm text-center max-w-sm">
            اختر أنواع الحقول من القائمة الموجودة على اليمين لإضافتها إلى النموذج.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <FieldPreview
              key={field.id}
              field={field}
              isSelected={index === selectedFieldIndex}
              onClick={() => selectField(index)}
              onUpdate={(updatedField) => updateField(index, updatedField)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
