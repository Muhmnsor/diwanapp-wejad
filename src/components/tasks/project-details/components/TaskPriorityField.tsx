
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskPriorityFieldProps {
  priority: string;
  setPriority: (value: string) => void;
}

export const TaskPriorityField = ({ priority, setPriority }: TaskPriorityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">الأولوية</Label>
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger id="priority">
          <SelectValue placeholder="اختر الأولوية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">منخفضة</SelectItem>
          <SelectItem value="medium">متوسطة</SelectItem>
          <SelectItem value="high">عالية</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
