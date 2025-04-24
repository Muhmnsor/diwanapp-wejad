
import { DynamicField } from "@/types/form-builder";
import { useFormBuilder } from "../FormBuilderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, MoveUp, MoveDown } from "lucide-react";
import { OptionsEditor } from "./OptionsEditor";
import { AlertTypeSelector } from "./AlertTypeSelector";
import { FileSettingsEditor } from "./FileSettingsEditor";

interface FieldSettingsProps {
  field: DynamicField;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const FieldSettings = ({ 
  field, 
  index,
  onRemove,
  onMoveUp,
  onMoveDown
}: FieldSettingsProps) => {
  const { updateField } = useFormBuilder();

  const handleLabelChange = (value: string) => {
    updateField(index, { ...field, label: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateField(index, { ...field, description: value });
  };

  const handleRequiredChange = (checked: boolean) => {
    updateField(index, { ...field, required: checked });
  };

  const handlePlaceholderChange = (value: string) => {
    updateField(index, { ...field, placeholder: value });
  };

  const handleOptionsChange = (options: any[]) => {
    updateField(index, { ...field, options });
  };

  const handleAlertTypeChange = (alertType: string) => {
    updateField(index, { 
      ...field, 
      config: { ...field.config, alertType: alertType as any } 
    });
  };

  // إعدادات مشتركة لجميع أنواع الحقول
  const commonSettings = (
    <>
      <div>
        <Label htmlFor="field-label">عنوان الحقل</Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {field.type !== 'section' && field.type !== 'alert' && (
        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">مطلوب</Label>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={handleRequiredChange}
          />
        </div>
      )}

      {field.type !== 'section' && field.type !== 'alert' && (
        <div>
          <Label htmlFor="field-description">نص وصفي للحقل (اختياري)</Label>
          <Input
            id="field-description"
            value={field.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
    </>
  );

  // إعدادات خاصة حسب نوع الحقل
  const renderSpecificSettings = () => {
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'number':
      case 'date':
      case 'phone':
        return (
          <div>
            <Label htmlFor="field-placeholder">نص توضيحي (Placeholder)</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              className="mt-1"
            />
          </div>
        );
      case 'dropdown':
      case 'radio':
      case 'checkbox':
      case 'multiselect':
        return (
          <OptionsEditor 
            options={field.options || []} 
            onChange={handleOptionsChange} 
          />
        );
      case 'section':
        return (
          <div>
            <Label htmlFor="field-description">وصف القسم</Label>
            <Textarea
              id="field-description"
              value={field.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        );
      case 'alert':
        return (
          <AlertTypeSelector 
            value={field.config?.alertType || 'info'} 
            onChange={handleAlertTypeChange} 
          />
        );
      case 'file':
        return (
          <FileSettingsEditor
            field={field}
            onChange={(updatedField) => updateField(index, updatedField)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {commonSettings}
      {renderSpecificSettings()}
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 ml-1" />
          حذف
        </Button>
        
        <div className="space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveUp}
          >
            <MoveUp className="h-4 w-4 ml-1" />
            للأعلى
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveDown}
          >
            <MoveDown className="h-4 w-4 ml-1" />
            للأسفل
          </Button>
        </div>
      </div>
    </div>
  );
};
