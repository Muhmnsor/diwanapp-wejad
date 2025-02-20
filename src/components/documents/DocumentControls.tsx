
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useState } from "react";

interface DocumentControlsProps {
  onSearch: (query: string) => void;
}

export const DocumentControls = ({ onSearch }: DocumentControlsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث في المستندات..."
          className="pl-10 w-full"
          dir="rtl"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        تصفية
      </Button>
    </div>
  );
};
