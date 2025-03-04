
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskPriorityFieldProps {
  priority: string;
  onPriorityChange: (priority: string) => void;
}

export const TaskPriorityField = ({ priority, onPriorityChange }: TaskPriorityFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="priority">الأولوية</Label>
      <Select onValueChange={onPriorityChange} defaultValue={priority}>
        <SelectTrigger>
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
