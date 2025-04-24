
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface AlertTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AlertTypeSelector = ({ value, onChange }: AlertTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>نوع التنبيه</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="info" id="alert-info" />
          <Info className="h-4 w-4 text-blue-500 ml-1" />
          <Label htmlFor="alert-info">معلومات</Label>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="warning" id="alert-warning" />
          <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
          <Label htmlFor="alert-warning">تحذير</Label>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="error" id="alert-error" />
          <AlertCircle className="h-4 w-4 text-red-500 ml-1" />
          <Label htmlFor="alert-error">خطأ</Label>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RadioGroupItem value="success" id="alert-success" />
          <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
          <Label htmlFor="alert-success">نجاح</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
