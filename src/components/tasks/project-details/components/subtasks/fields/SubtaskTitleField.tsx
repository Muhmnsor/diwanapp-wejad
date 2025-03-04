
import { Input } from "@/components/ui/input";

interface SubtaskTitleFieldProps {
  title: string;
  setTitle: (value: string) => void;
}

export const SubtaskTitleField = ({ title, setTitle }: SubtaskTitleFieldProps) => {
  return (
    <div>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان المهمة الفرعية"
        className="w-full"
        required
        autoFocus
      />
    </div>
  );
};
