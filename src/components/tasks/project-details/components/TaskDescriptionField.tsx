
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionFieldProps {
  description: string;
  setDescription: (value: string) => void;
}

export const TaskDescriptionField = ({ description, setDescription }: TaskDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">وصف المهمة</Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="أدخل وصف المهمة"
        rows={3}
      />
    </div>
  );
};
