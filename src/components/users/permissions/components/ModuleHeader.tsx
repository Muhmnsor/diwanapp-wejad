
import { ChevronDown, ChevronLeft, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModuleHeaderProps } from "../types";
import { cn } from "@/lib/utils";
import { getModuleDisplayName } from "../utils/moduleMapping";

export const ModuleHeader = ({
  moduleName,
  moduleDisplayName,
  areAllSelected,
  areSomeSelected,
  onModuleToggle,
  onToggleOpen,
  isOpen,
}: ModuleHeaderProps) => {
  const displayName = moduleDisplayName || getModuleDisplayName(moduleName);

  return (
    <div className="bg-muted p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative">
          <Checkbox
            id={`module-${moduleName}`}
            checked={areAllSelected || areSomeSelected}
            onCheckedChange={() => onModuleToggle(moduleName)}
            aria-label={`تحديد كل صلاحيات ${displayName}`}
          />
          {areSomeSelected && !areAllSelected && (
            <Minus 
              className="h-2.5 w-2.5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white"
              aria-hidden="true"
            />
          )}
        </div>
        <label
          htmlFor={`module-${moduleName}`}
          className="text-sm font-medium select-none cursor-pointer"
        >
          {displayName}
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggleOpen(moduleName)}
        aria-label={isOpen ? "طي الوحدة" : "توسيع الوحدة"}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
