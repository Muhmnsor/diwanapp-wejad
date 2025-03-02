
import { Search, Filter } from "lucide-react";
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
  filteredCount 
}: SearchFilterProps) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:w-72">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن المستخدمين..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pr-10 pl-4"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {filteredCount} من {totalCount} مستخدم
        </span>
      </div>
    </div>
  );
};
