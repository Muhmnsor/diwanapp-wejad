
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TemplateCategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onAddCategory: (category: string) => void;
}

export const TemplateCategorySelector = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onAddCategory,
}: TemplateCategorySelectorProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory("");
    }
    setIsAddingCategory(false);
  };

  return (
    <div className="flex gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedCategory || "جميع القوالب"}
            <span className="sr-only">اختر تصنيف</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => onCategorySelect("")}>
            جميع القوالب
            {!selectedCategory && <Check className="mr-auto h-4 w-4" />}
          </DropdownMenuItem>
          
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => onCategorySelect(category)}
            >
              {category}
              {selectedCategory === category && (
                <Check className="mr-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuItem onClick={() => setIsAddingCategory(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة تصنيف جديد
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAddingCategory && (
        <div className="flex gap-2 items-center">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="اسم التصنيف الجديد"
            className="w-[200px]"
            autoFocus
          />
          <Button size="sm" onClick={handleAddCategory}>
            إضافة
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddingCategory(false)}
          >
            إلغاء
          </Button>
        </div>
      )}
    </div>
  );
};
