
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePeriodSelectorProps {
  timePeriod: string;
  onTimePeriodChange: (value: string) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ 
  timePeriod, 
  onTimePeriodChange 
}) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="timePeriod" className="text-right col-span-1">
        الفترة الزمنية
      </Label>
      <Select
        value={timePeriod}
        onValueChange={onTimePeriodChange}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current-year">السنة الحالية</SelectItem>
          <SelectItem value="last-year">السنة الماضية</SelectItem>
          <SelectItem value="current-quarter">الربع الحالي</SelectItem>
          <SelectItem value="custom">فترة مخصصة</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
