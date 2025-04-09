
import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const handleSelect = (range: DateRange | undefined) => {
    onSelect(range || { from: undefined, to: undefined });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-right font-normal",
              !from && !to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "PPP", { locale: ar })} - {format(to, "PPP", { locale: ar })}
                </>
              ) : (
                format(from, "PPP", { locale: ar })
              )
            ) : (
              "اختر الفترة الزمنية"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ar}
          />
          <div className="flex items-center justify-between p-3 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date();
                  weekAgo.setDate(today.getDate() - 7);
                  onSelect({ from: weekAgo, to: today });
                  setOpen(false);
                }}
              >
                آخر 7 أيام
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date();
                  monthAgo.setMonth(today.getMonth() - 1);
                  onSelect({ from: monthAgo, to: today });
                  setOpen(false);
                }}
              >
                آخر 30 يوم
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onSelect({ from: undefined, to: undefined });
                setOpen(false);
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

