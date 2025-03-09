
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SelectOptionsSectionProps {
  options: string[];
  currentOption: string;
  setCurrentOption: (option: string) => void;
  handleAddOption: () => void;
  handleRemoveOption: (index: number) => void;
}

export const SelectOptionsSection = ({
  options,
  currentOption,
  setCurrentOption,
  handleAddOption,
  handleRemoveOption
}: SelectOptionsSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">قيم القائمة المنسدلة</label>
      
      <div className="flex space-x-2">
        <Input
          value={currentOption}
          onChange={(e) => setCurrentOption(e.target.value)}
          placeholder="أضف قيمة جديدة"
          className="flex-1 ml-2"
        />
        <Button type="button" size="sm" onClick={handleAddOption}>إضافة</Button>
      </div>

      <div className="space-y-2 mt-2">
        {options.map((option, i) => (
          <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
            <span>{option}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveOption(i)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
