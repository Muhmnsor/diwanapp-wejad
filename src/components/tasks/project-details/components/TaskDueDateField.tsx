
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ar } from "date-fns/locale";

interface TaskDueDateFieldProps {
  dueDate: Date | null;
  onDueDateChange: (date: Date | null) => void;
}

export const TaskDueDateField = ({ dueDate, onDueDateChange }: TaskDueDateFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="due-date">تاريخ التسليم</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="due-date"
            variant="outline"
            className={cn(
              "w-full justify-start text-right font-normal",
              !dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {dueDate ? format(dueDate, "PPP", { locale: ar }) : <span>اختر تاريخ التسليم</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={onDueDateChange}
            initialFocus
            locale={ar}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
