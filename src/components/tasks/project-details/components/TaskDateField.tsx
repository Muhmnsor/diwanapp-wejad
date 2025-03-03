
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";

interface TaskDateFieldProps {
  dueDate: string;
  setDueDate: (value: string) => void;
}

export const TaskDateField = ({ dueDate, setDueDate }: TaskDateFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
      <div className="flex items-center">
        <CalendarIcon className="w-4 h-4 me-2 text-gray-500" />
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
    </div>
  );
};
