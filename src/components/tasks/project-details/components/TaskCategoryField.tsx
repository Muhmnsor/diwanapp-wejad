
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskCategoryFieldProps {
  category: string;
  setCategory: (value: string) => void;
}

export const TaskCategoryField = ({ category, setCategory }: TaskCategoryFieldProps) => {
  const categories = [
    { value: "إدارية", label: "إدارية" },
    { value: "تقنية", label: "تقنية" },
    { value: "مالية", label: "مالية" },
    { value: "تطويرية", label: "تطويرية" },
    { value: "تسويقية", label: "تسويقية" },
    { value: "أخرى", label: "أخرى" }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="category">تصنيف المهمة</Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger id="category">
          <SelectValue placeholder="اختر تصنيف المهمة" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
