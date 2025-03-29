
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TemplateFilterOptions } from "./types/template";

interface TemplateControlsProps {
  onSearch: (query: string) => void;
  onFilterDepartmentChange: (departments: string[]) => void;
  onFilterCategoryChange: (categories: string[]) => void;
  onAddTemplate: () => void;
  filterOptions: TemplateFilterOptions;
}

export const TemplateControls = ({
  onSearch,
  onFilterDepartmentChange,
  onFilterCategoryChange,
  onAddTemplate,
  filterOptions,
}: TemplateControlsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDepartmentChange = (department: string, checked: boolean) => {
    const updatedDepartments = checked
      ? [...selectedDepartments, department]
      : selectedDepartments.filter((d) => d !== department);
    
    setSelectedDepartments(updatedDepartments);
    onFilterDepartmentChange(updatedDepartments);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
    
    setSelectedCategories(updatedCategories);
    onFilterCategoryChange(updatedCategories);
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:space-x-reverse md:items-center md:justify-between mb-6">
      <div className="flex space-x-2 space-x-reverse">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن نموذج..."
            className="pl-2 pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[200px]">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">الإدارات</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filterOptions.departments.map((department) => (
                    <div key={department} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`dept-${department}`}
                        checked={selectedDepartments.includes(department)}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange(department, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`dept-${department}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {department}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {filterOptions.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">التصنيفات</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`cat-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(category, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`cat-${category}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={onAddTemplate}>
        <Plus className="mr-1 h-4 w-4" />
        إضافة نموذج
      </Button>
    </div>
  );
};
