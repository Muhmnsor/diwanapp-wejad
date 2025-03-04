
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';
import { useState, useEffect } from "react";

interface SubtaskDueDateFieldProps {
  dueDate: string;
  setDueDate: (value: string) => void;
}

export const SubtaskDueDateField = ({ dueDate, setDueDate }: SubtaskDueDateFieldProps) => {
  // تحويل النص إلى كائن تاريخ لاستخدامه مع مكون التقويم
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );

  // عند تغيير التاريخ المحدد، قم بتحديث قيمة النص
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setDueDate(dateString);
    }
  }, [selectedDate, setDueDate]);

  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">تاريخ الاستحقاق</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-right font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP", { locale: ar }) : <span>اختر تاريخ الاستحقاق</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ar}
            className="w-full dir-rtl"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
