
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentControlsProps {
  onSearch: (query: string) => void;
  onFilterStatusChange?: (status: string[]) => void;
}

export const DocumentControls = ({ onSearch, onFilterStatusChange }: DocumentControlsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleStatusChange = (status: string) => {
    const updatedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    setSelectedStatuses(updatedStatuses);
    if (onFilterStatusChange) {
      onFilterStatusChange(updatedStatuses);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث في المستندات..."
          className="pr-10 w-full"
          dir="rtl"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            تصفية
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuCheckboxItem
            checked={selectedStatuses.includes("ساري")}
            onCheckedChange={() => handleStatusChange("ساري")}
          >
            ساري
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedStatuses.includes("منتهي")}
            onCheckedChange={() => handleStatusChange("منتهي")}
          >
            منتهي
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedStatuses.includes("قريب من الانتهاء")}
            onCheckedChange={() => handleStatusChange("قريب من الانتهاء")}
          >
            قريب من الانتهاء
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
