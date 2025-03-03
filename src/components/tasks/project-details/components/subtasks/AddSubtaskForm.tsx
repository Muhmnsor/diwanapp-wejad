
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardEvent } from "react";

interface AddSubtaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddSubtaskForm = ({ value, onChange, onSubmit, onCancel }: AddSubtaskFormProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="عنوان المهمة الفرعية"
        className="text-sm"
        autoFocus
      />
      <div className="flex gap-1">
        <Button 
          type="button" 
          size="sm" 
          className="h-9"
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          إضافة
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={onCancel}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
};
