import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ManualInput: FC<ManualInputProps> = ({ value, onChange, onSubmit }) => {
  return (
    <div className="space-y-2">
      <Label>رقم التسجيل</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ادخل رقم التسجيل"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <Button onClick={onSubmit} className="w-full">
        تحضير
      </Button>
    </div>
  );
};