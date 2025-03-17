
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MeetingsFilterProps {
  onFilterChange: (filters: {
    status?: string;
    type?: string;
    search?: string;
  }) => void;
}

export const MeetingsFilter = ({ onFilterChange }: MeetingsFilterProps) => {
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters(value, type, search);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    applyFilters(status, value, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    applyFilters(status, type, e.target.value);
  };

  const applyFilters = (
    statusValue: string,
    typeValue: string,
    searchValue: string
  ) => {
    onFilterChange({
      status: statusValue || undefined,
      type: typeValue || undefined,
      search: searchValue || undefined,
    });
  };

  const resetFilters = () => {
    setStatus("");
    setType("");
    setSearch("");
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center" dir="rtl">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن اجتماع..."
          value={search}
          onChange={handleSearchChange}
          className="pl-3 pr-9"
        />
      </div>
      
      <div className="flex flex-1 gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">كل الحالات</SelectItem>
            <SelectItem value="scheduled">مجدول</SelectItem>
            <SelectItem value="in_progress">جاري</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">كل الأنواع</SelectItem>
            <SelectItem value="board">مجلس إدارة</SelectItem>
            <SelectItem value="department">قسم</SelectItem>
            <SelectItem value="team">فريق</SelectItem>
            <SelectItem value="committee">لجنة</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        onClick={resetFilters}
        className="flex-shrink-0"
      >
        إعادة ضبط
      </Button>
    </div>
  );
};
