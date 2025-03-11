
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { ModuleHeaderProps } from "../types";
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
  return (
    <div
      className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/60 cursor-pointer"
      onClick={onToggleOpen}
    >
      <div className="flex items-center">
        <div
          className={`w-5 h-5 border rounded flex items-center justify-center mr-2 cursor-pointer ${
            areAllSelected || areSomeSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-input"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onModuleToggle();
          }}
        >
          {areAllSelected && <Check className="h-3.5 w-3.5" />}
          {areSomeSelected && !areAllSelected && (
            <div className="w-2 h-2 bg-primary rounded-sm"></div>
          )}
        </div>
        <span className="font-medium">{moduleDisplayName}</span>
      </div>
      <div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </div>
    </div>
  );
};
