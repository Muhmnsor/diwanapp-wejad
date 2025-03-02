
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export const SearchFilter = ({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
}: SearchFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4" dir="rtl">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث باسم المستخدم أو الدور..."
          className="w-full sm:w-[300px] pr-10 text-right"
          dir="rtl"
        />
      </div>
      <div className="text-sm text-muted-foreground text-right">
        {filteredCount === totalCount
          ? `${totalCount} مستخدمين`
          : `${filteredCount} من أصل ${totalCount} مستخدمين`}
      </div>
    </div>
  );
};
