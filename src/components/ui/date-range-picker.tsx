
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  locale?: any;
  dir?: "ltr" | "rtl";
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select a date range",
  locale,
  dir = "ltr"
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onChange) {
      onChange(range);
    }
  };

  return (
    <div className={cn("grid gap-2", dir === "rtl" ? "text-right" : "")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-10 min-w-[240px] justify-between text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <span>
                    {format(date.from, "LLL dd, y", { locale })} - {format(date.to, "LLL dd, y", { locale })}
                  </span>
                ) : (
                  format(date.from, "LLL dd, y", { locale })
                )
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={locale}
            dir={dir}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
