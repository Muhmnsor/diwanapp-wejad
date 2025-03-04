
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubtaskDueDateFieldProps {
  dueDate: string;
  setDueDate: (value: string) => void;
}

export const SubtaskDueDateField = ({ dueDate, setDueDate }: SubtaskDueDateFieldProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">تاريخ الاستحقاق</Label>
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5 text-gray-500" />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full text-right"
          dir="rtl"
        />
      </div>
    </div>
  );
};
