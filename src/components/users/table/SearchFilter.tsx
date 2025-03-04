
import { Search, UserX, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  showActiveOnly?: boolean;
  onToggleActiveFilter?: (showActiveOnly: boolean) => void;
}

export const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  totalCount, 
  filteredCount,
  showActiveOnly = true,
  onToggleActiveFilter
}: SearchFilterProps) => {
  return (
    <div className="flex justify-between items-center mb-4 flex-wrap">
      <div className="relative flex items-center w-64">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="البحث عن المستخدمين..."
          className="pr-3 pl-8 text-right"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-4">
        {onToggleActiveFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActiveFilter(!showActiveOnly)}
            className="text-xs flex items-center gap-1"
          >
            {showActiveOnly ? (
              <>
                <UserX className="h-3.5 w-3.5" />
                إظهار المعطلين
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                إخفاء المعطلين
              </>
            )}
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} مستخدم`
            : `${filteredCount} من ${totalCount} مستخدم`}
        </p>
      </div>
    </div>
  );
};
