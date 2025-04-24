
import { useState } from "react";
import { FieldOption } from "@/types/form-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, MoveUp, MoveDown, GripVertical } from "lucide-react";

interface OptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}

export const OptionsEditor = ({ options, onChange }: OptionsEditorProps) => {
  const handleAddOption = () => {
    const newOption = {
      label: `خيار ${options.length + 1}`,
      value: `option${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  const handleOptionChange = (index: number, field: keyof FieldOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const handleMoveOption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === options.length - 1)
    ) {
      return;
    }

    const newOptions = [...options];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
    
    onChange(newOptions);
  };

  return (
    <div className="space-y-3">
      <Label>الخيارات</Label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex-shrink-0 cursor-move">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <Input
              value={option.label}
              onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
              placeholder="عنوان الخيار"
              className="flex-1"
            />
            
            <Input
              value={option.value}
              onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
              placeholder="قيمة الخيار"
              className="w-1/3"
            />
            
            <div className="flex space-x-1 rtl:space-x-reverse">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleMoveOption(index, 'up')}
                disabled={index === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleMoveOption(index, 'down')}
                disabled={index === options.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleAddOption}
      >
        <Plus className="h-4 w-4 ml-1" />
        إضافة خيار جديد
      </Button>
    </div>
  );
};
