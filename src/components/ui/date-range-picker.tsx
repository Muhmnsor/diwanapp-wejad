
import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
  value?: DateRange;
  onChange: (date: DateRange | undefined) => void;
  placeholder?: string;
  align?: "center" | "start" | "end" | "left" | "right";
  locale?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  align = "left",
  locale = "en"
}: DateRangePickerProps) {
  const isArabic = locale === "ar";
  const displayFormat = isArabic ? "dd MMM yyyy" : "MMM dd, yyyy";
  const dateLocale = isArabic ? ar : undefined;

  return (
    <div className={cn("grid gap-2", isArabic && "text-right")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              isArabic && "flex-row-reverse text-right"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {isArabic ? (
                    <>
                      {format(value.to, displayFormat, { locale: dateLocale })} -{" "}
                      {format(value.from, displayFormat, { locale: dateLocale })}
                    </>
                  ) : (
                    <>
                      {format(value.from, displayFormat, { locale: dateLocale })} -{" "}
                      {format(value.to, displayFormat, { locale: dateLocale })}
                    </>
                  )}
                </>
              ) : (
                format(value.from, displayFormat, { locale: dateLocale })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            dir={isArabic ? "rtl" : "ltr"}
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={dateLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
