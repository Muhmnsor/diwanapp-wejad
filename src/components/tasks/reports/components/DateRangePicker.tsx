
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"start" | "end">("start");
  const [localStartDate, setLocalStartDate] = useState<Date>(value.startDate);
  const [localEndDate, setLocalEndDate] = useState<Date>(value.endDate);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;

    if (mode === "start") {
      setLocalStartDate(date);
      setMode("end");
    } else {
      setLocalEndDate(date);
      onChange({ startDate: localStartDate, endDate: date });
      setOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-right"
          onClick={() => {
            setMode("start");
            setOpen(true);
          }}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {formatDate(value.startDate)} إلى {formatDate(value.endDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <h4 className="text-center text-sm font-medium">
            {mode === "start" ? "اختر تاريخ البداية" : "اختر تاريخ النهاية"}
          </h4>
        </div>
        <Calendar
          mode="single"
          selected={mode === "start" ? localStartDate : localEndDate}
          onSelect={handleCalendarSelect}
          dir="rtl"
          disabled={(date) => {
            if (mode === "end") {
              // Disable dates before start date when selecting end date
              return date < localStartDate;
            }
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
