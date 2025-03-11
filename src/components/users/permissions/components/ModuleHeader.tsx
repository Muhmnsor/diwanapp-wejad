
import { ChevronDown, ChevronLeft, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Module } from "../types";

interface ModuleHeaderProps {
  module: Module;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  onModuleToggle: (module: Module) => void;
  onToggleOpen: () => void;
}

export const ModuleHeader = ({
  module,
  areAllSelected,
  areSomeSelected,
  onModuleToggle,
  onToggleOpen,
}: ModuleHeaderProps) => {
  return (
    <div className="bg-muted p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative">
          <Checkbox
            id={`module-${module.name}`}
            checked={areAllSelected || areSomeSelected}
            onCheckedChange={() => onModuleToggle(module)}
            aria-label={`تحديد كل صلاحيات ${module.name}`}
          />
          {areSomeSelected && !areAllSelected && (
            <Minus 
              className="h-2.5 w-2.5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white"
              aria-hidden="true"
            />
          )}
        </div>
        <label
          htmlFor={`module-${module.name}`}
          className="text-sm font-medium select-none cursor-pointer"
        >
          {module.name}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleOpen}
        aria-label={module.isOpen ? "طي الوحدة" : "توسيع الوحدة"}
      >
        {module.isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
