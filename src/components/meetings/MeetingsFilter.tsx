
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
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
}

export const MeetingsFilter = ({ onStatusChange, onTypeChange }: MeetingsFilterProps) => {
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    onTypeChange(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Note: Search functionality will be implemented in a future update
  };

  const resetFilters = () => {
    setStatus("");
    setType("");
    setSearch("");
    onStatusChange("");
    onTypeChange("");
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
