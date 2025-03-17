
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MeetingsFilterProps {
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
  onSearchChange?: (search: string) => void;
}

export const MeetingsFilter = ({ onStatusChange, onTypeChange, onSearchChange }: MeetingsFilterProps) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Label htmlFor="status-filter" className="mb-2 block">تصفية حسب الحالة</Label>
          <Select onValueChange={onStatusChange} defaultValue="">
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الحالات</SelectItem>
              <SelectItem value="scheduled">مجدول</SelectItem>
              <SelectItem value="in_progress">جاري</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/3">
          <Label htmlFor="type-filter" className="mb-2 block">تصفية حسب النوع</Label>
          <Select onValueChange={onTypeChange} defaultValue="">
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="جميع أنواع الاجتماعات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الأنواع</SelectItem>
              <SelectItem value="board">مجلس إدارة</SelectItem>
              <SelectItem value="department">قسم</SelectItem>
              <SelectItem value="team">فريق</SelectItem>
              <SelectItem value="committee">لجنة</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {onSearchChange && (
          <div className="w-full md:w-1/3">
            <Label htmlFor="search-meetings" className="mb-2 block">بحث</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-meetings"
                placeholder="ابحث عن اجتماعات..."
                className="pl-10"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
