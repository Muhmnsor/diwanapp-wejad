
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DateRangePickerProps {
  value: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (value: { startDate: Date; endDate: Date }) => void;
}

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [isStartDate, setIsStartDate] = React.useState(true);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    if (isStartDate) {
      onChange({
        startDate: date,
        endDate: value.endDate < date ? date : value.endDate,
      });
      setIsStartDate(false);
    } else {
      onChange({
        startDate: value.startDate,
        endDate: date,
      });
      setIsStartDate(true);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-right">
          <CalendarIcon className="ml-2 h-4 w-4" />
          <span>
            {format(value.startDate, "yyyy/MM/dd", { locale: ar })} -{" "}
            {format(value.endDate, "yyyy/MM/dd", { locale: ar })}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isStartDate ? value.startDate : value.endDate}
          onSelect={handleSelect}
          initialFocus
          locale={ar}
        />
        <div className="p-3 border-t border-border">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isStartDate ? "default" : "outline"}
                onClick={() => setIsStartDate(true)}
                size="sm"
              >
                تاريخ البداية
              </Button>
              <Button
                variant={!isStartDate ? "default" : "outline"}
                onClick={() => setIsStartDate(false)}
                size="sm"
              >
                تاريخ النهاية
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {isStartDate ? "اختر تاريخ البداية" : "اختر تاريخ النهاية"}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
