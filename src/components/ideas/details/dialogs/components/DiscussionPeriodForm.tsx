
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExtendFormData } from "../types";

interface DiscussionPeriodFormProps {
  formData: ExtendFormData;
  onFormChange: (data: Partial<ExtendFormData>) => void;
}

export const DiscussionPeriodForm: React.FC<DiscussionPeriodFormProps> = ({ 
  formData, 
  onFormChange 
}) => {
  const { days, hours, operation } = formData;
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>نوع العملية:</Label>
        <RadioGroup
          value={operation}
          onValueChange={(value) => onFormChange({ operation: value as "add" | "subtract" })}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="add" id="add" />
            <Label htmlFor="add">تمديد</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="subtract" id="subtract" />
            <Label htmlFor="subtract">تنقيص</Label>
          </div>
        </RadioGroup>
      </div>
    
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="days" className="text-right col-span-1">الأيام</Label>
          <Input
            id="days"
            type="number"
            min="0"
            value={days}
            onChange={(e) => onFormChange({ days: parseInt(e.target.value) || 0 })}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hours" className="text-right col-span-1">الساعات</Label>
          <Input
            id="hours"
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => onFormChange({ hours: parseInt(e.target.value) || 0 })}
            className="col-span-3"
          />
        </div>
      </div>
    </div>
  );
};
