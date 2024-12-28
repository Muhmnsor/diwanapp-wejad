import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardFiltersProps {
  selectedPath: string;
  selectedCategory: string;
  onPathChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const DashboardFilters = ({
  selectedPath,
  selectedCategory,
  onPathChange,
  onCategoryChange
}: DashboardFiltersProps) => {
  return (
    <div className="flex gap-4 items-center justify-end">
      <Select
        value={selectedPath}
        onValueChange={onPathChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="اختر المسار" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع المسارات</SelectItem>
          <SelectItem value="environment">البيئة</SelectItem>
          <SelectItem value="health">الصحة</SelectItem>
          <SelectItem value="education">التعليم</SelectItem>
          <SelectItem value="social">الاجتماعي</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="اختر التصنيف" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع التصنيفات</SelectItem>
          <SelectItem value="free">مجاني</SelectItem>
          <SelectItem value="paid">مدفوع</SelectItem>
          <SelectItem value="spiritual">روحي</SelectItem>
          <SelectItem value="professional">مهني</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};