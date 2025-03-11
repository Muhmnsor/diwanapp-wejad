
import { useState } from "react";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";

interface RequestFiltersProps {
  onFilterChange: (filters: { status?: string; priority?: string; search?: string }) => void;
}

export const RequestFilters = ({ onFilterChange }: RequestFiltersProps) => {
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const applyFilters = () => {
    onFilterChange({
      status: status || undefined,
      priority: priority || undefined,
      search: search || undefined
    });
  };

  const clearFilters = () => {
    setStatus("");
    setPriority("");
    setSearch("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الطلبات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الحالات</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="approved">تمت الموافقة</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الأولويات</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={applyFilters} variant="default" size="sm">
            <Filter className="h-4 w-4 ml-1" />
            تصفية
          </Button>
          
          <Button onClick={clearFilters} variant="outline" size="sm">
            <X className="h-4 w-4 ml-1" />
            مسح
          </Button>
        </div>
      </div>
    </div>
  );
};
