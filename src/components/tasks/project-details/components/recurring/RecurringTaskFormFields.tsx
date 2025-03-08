
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export interface RecurringTaskFormValues {
  frequency: string;
  interval: number;
  endDate?: string;
  endAfter?: number;
  endType: 'date' | 'count' | 'never';
  daysOfWeek?: string[];
  dayOfMonth?: number;
}

interface RecurringTaskFormFieldsProps {
  values: RecurringTaskFormValues;
  onChange: (values: RecurringTaskFormValues) => void;
}

export const RecurringTaskFormFields = ({ values, onChange }: RecurringTaskFormFieldsProps) => {
  const [localValues, setLocalValues] = useState<RecurringTaskFormValues>(values);
  
  const handleChange = (field: string, value: any) => {
    const updatedValues = { ...localValues, [field]: value };
    setLocalValues(updatedValues);
    onChange(updatedValues);
  };
  
  const handleDayToggle = (day: string) => {
    const currentDays = localValues.daysOfWeek || [];
    let newDays: string[];
    
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    
    handleChange('daysOfWeek', newDays);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="frequency">التكرار</Label>
        <Select
          value={localValues.frequency}
          onValueChange={(value) => handleChange('frequency', value)}
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="اختر نمط التكرار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">يومي</SelectItem>
            <SelectItem value="weekly">أسبوعي</SelectItem>
            <SelectItem value="monthly">شهري</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="interval">كل</Label>
        <div className="flex items-center gap-2">
          <Input
            id="interval"
            type="number"
            min={1}
            value={localValues.interval}
            onChange={(e) => handleChange('interval', parseInt(e.target.value) || 1)}
            className="w-24"
          />
          <span>
            {localValues.frequency === 'daily' && 'يوم'}
            {localValues.frequency === 'weekly' && 'أسبوع'}
            {localValues.frequency === 'monthly' && 'شهر'}
          </span>
        </div>
      </div>
      
      {localValues.frequency === 'weekly' && (
        <div>
          <Label className="mb-2 block">أيام الأسبوع</Label>
          <div className="flex flex-wrap gap-2 rtl">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
              <div key={day} className="flex items-center gap-1.5">
                <Checkbox 
                  id={`day-${day}`}
                  checked={(localValues.daysOfWeek || []).includes(day)}
                  onCheckedChange={() => handleDayToggle(day)}
                />
                <Label htmlFor={`day-${day}`} className="cursor-pointer">
                  {day === 'sun' && 'الأحد'}
                  {day === 'mon' && 'الإثنين'}
                  {day === 'tue' && 'الثلاثاء'}
                  {day === 'wed' && 'الأربعاء'}
                  {day === 'thu' && 'الخميس'}
                  {day === 'fri' && 'الجمعة'}
                  {day === 'sat' && 'السبت'}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {localValues.frequency === 'monthly' && (
        <div>
          <Label htmlFor="dayOfMonth">اليوم من الشهر</Label>
          <Input
            id="dayOfMonth"
            type="number"
            min={1}
            max={31}
            value={localValues.dayOfMonth || 1}
            onChange={(e) => handleChange('dayOfMonth', parseInt(e.target.value) || 1)}
            className="w-24"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <Label>ينتهي</Label>
        <RadioGroup
          value={localValues.endType}
          onValueChange={(value) => handleChange('endType', value as 'date' | 'count' | 'never')}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="never" id="never" />
            <Label htmlFor="never" className="cursor-pointer">أبداً</Label>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="date" id="date" />
            <Label htmlFor="date" className="cursor-pointer">في تاريخ</Label>
            <Input
              type="date"
              value={localValues.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={localValues.endType !== 'date'}
              className="w-auto mx-2"
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="count" id="count" />
            <Label htmlFor="count" className="cursor-pointer">بعد</Label>
            <Input
              type="number"
              min={1}
              value={localValues.endAfter || 1}
              onChange={(e) => handleChange('endAfter', parseInt(e.target.value) || 1)}
              disabled={localValues.endType !== 'count'}
              className="w-20 mx-2"
            />
            <span>مرات</span>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
