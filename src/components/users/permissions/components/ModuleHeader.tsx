
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Module } from "../types";

interface ModuleHeaderProps {
  module: Module;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  onModuleToggle: () => void;
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
    <div
      className="flex items-center justify-between p-4 bg-muted cursor-pointer"
      onClick={onToggleOpen}
    >
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox
          id={`module-${module.name}`}
          checked={areAllSelected}
          onClick={(e) => {
            e.stopPropagation();
            onModuleToggle();
          }}
          data-state={
            areAllSelected ? "checked" : areSomeSelected ? "indeterminate" : "unchecked"
          }
          className={areSomeSelected ? "opacity-80" : ""}
        />
        <label
          htmlFor={`module-${module.name}`}
          className="text-sm font-medium cursor-pointer select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {module.name}
        </label>
      </div>
      {module.isOpen ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </div>
  );
};
