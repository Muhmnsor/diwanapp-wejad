
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPeriodDisplay } from "../utils/formatUtils";

interface DiscussionPeriodInputsProps {
  days: number;
  setDays: (days: number) => void;
  hours: number;
  setHours: (hours: number) => void;
  operation: string;
  setOperation: (operation: string) => void;
  totalCurrentHours: number;
  remainingDays: number;
  remainingHours: number;
}

export const DiscussionPeriodInputs = ({
  days,
  setDays,
  hours,
  setHours,
  operation,
  setOperation,
  totalCurrentHours,
  remainingDays,
  remainingHours
}: DiscussionPeriodInputsProps) => {
  return (
    <div className="space-y-4">
      {/* عرض الوقت الحالي والمتبقي */}
      <div className="p-3 bg-purple-50 rounded-md space-y-2">
        <p className="text-sm font-medium text-purple-800">
          الفترة الكلية الحالية: {formatPeriodDisplay(Math.floor(totalCurrentHours / 24), Math.floor(totalCurrentHours % 24))}
        </p>
        
        <p className="text-sm text-purple-700">
          الوقت المتبقي حالياً: {remainingDays === 0 && remainingHours === 0 
            ? "المناقشة منتهية" 
            : formatPeriodDisplay(remainingDays, remainingHours)}
        </p>
      </div>
      
      {/* اختيار نوع العملية (تمديد/تنقيص) */}
      <div className="space-y-2">
        <Label>نوع العملية:</Label>
        <RadioGroup
          value={operation}
          onValueChange={setOperation}
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
            onChange={(e) => setDays(parseInt(e.target.value) || 0)}
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
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="col-span-3"
          />
        </div>
      </div>
    </div>
  );
};
