
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskTitleFieldProps {
  title: string;
  setTitle: (value: string) => void;
}

export const TaskTitleField = ({ title, setTitle }: TaskTitleFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">عنوان المهمة</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="أدخل عنوان المهمة"
        required
      />
    </div>
  );
};
