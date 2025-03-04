
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';

interface TaskDueDateFieldProps {
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
}

export const TaskDueDateField = ({ dueDate, setDueDate }: TaskDueDateFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="due-date">تاريخ التسليم</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-right font-normal",
              !dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {dueDate ? format(dueDate, "PPP", { locale: ar }) : <span>اختر تاريخ التسليم</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            locale={ar}
            className="w-full dir-rtl"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
