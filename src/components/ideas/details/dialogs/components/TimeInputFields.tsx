
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeInputFieldsProps {
  days: number;
  hours: number;
  onDaysChange: (value: number) => void;
  onHoursChange: (value: number) => void;
}

export const TimeInputFields = ({
  days,
  hours,
  onDaysChange,
  onHoursChange,
}: TimeInputFieldsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="days" className="text-right col-span-1">الأيام</Label>
        <Input
          id="days"
          type="number"
          min="0"
          value={days}
          onChange={(e) => onDaysChange(parseInt(e.target.value) || 0)}
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
          onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
          className="col-span-3"
        />
      </div>
    </div>
  );
};
