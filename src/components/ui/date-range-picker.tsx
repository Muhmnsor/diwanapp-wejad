
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { ar } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange | undefined
  onChange?: (date: DateRange | undefined) => void
  placeholder?: string
  align?: "start" | "center" | "end"
  locale?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  align = "center",
  locale = "en-US"
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value)

  // Update internal state when value prop changes
  React.useEffect(() => {
    setDateRange(value)
  }, [value])

  // Update parent component when dateRange changes
  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (onChange) {
      onChange(range)
    }
  }

  const localeObj = locale === "ar" ? ar : undefined

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-right",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ms-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y", {locale: localeObj})} -{" "}
                  {format(dateRange.to, "LLL dd, y", {locale: localeObj})}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y", {locale: localeObj})
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={localeObj}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
