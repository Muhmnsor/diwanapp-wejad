import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DashboardFiltersProps {
  onFilterChange: (type: string, value: string) => void;
  selectedPath?: string;
  selectedCategory?: string;
  selectedPrice?: string;
}

export const DashboardFilters = ({
  onFilterChange,
  selectedPath,
  selectedCategory,
  selectedPrice
}: DashboardFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label>المسار</Label>
        <Select
          value={selectedPath}
          onValueChange={(value) => onFilterChange('path', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر المسار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="environment">البيئة</SelectItem>
            <SelectItem value="community">المجتمع</SelectItem>
            <SelectItem value="content">المحتوى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>التصنيف</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => onFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="social">اجتماعي</SelectItem>
            <SelectItem value="entertainment">ترفيهي</SelectItem>
            <SelectItem value="service">خدمي</SelectItem>
            <SelectItem value="educational">تعليمي</SelectItem>
            <SelectItem value="consulting">استشاري</SelectItem>
            <SelectItem value="interest">اهتمام</SelectItem>
            <SelectItem value="specialization">تخصص</SelectItem>
            <SelectItem value="spiritual">روحي</SelectItem>
            <SelectItem value="cultural">ثقافي</SelectItem>
            <SelectItem value="behavioral">سلوكي</SelectItem>
            <SelectItem value="skill">مهاري</SelectItem>
            <SelectItem value="health">صحي</SelectItem>
            <SelectItem value="diverse">متنوع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>السعر</Label>
        <Select
          value={selectedPrice}
          onValueChange={(value) => onFilterChange('price', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر السعر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="paid">مدفوع</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};