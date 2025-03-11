
import { ChevronDown, ChevronRight, Check, Minus } from "lucide-react";
import { ModuleHeaderProps } from "../types";

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
      className={`flex items-center justify-between p-3 cursor-pointer ${
        isOpen ? "bg-primary/10" : "bg-muted/50"
      }`}
    >
      <div className="flex items-center" onClick={() => onToggleOpen(moduleName)}>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        <span className="font-medium">{moduleDisplayName || moduleName}</span>
      </div>
      
      <div 
        className={`flex items-center justify-center w-6 h-6 rounded border ${
          areAllSelected
            ? "bg-primary border-primary text-primary-foreground"
            : areSomeSelected
            ? "bg-primary/20 border-primary text-primary"
            : "border-input"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onModuleToggle(moduleName);
        }}
        data-testid={`module-toggle-${moduleName}`}
      >
        {areAllSelected ? (
          <Check className="h-4 w-4" />
        ) : areSomeSelected ? (
          <Minus className="h-4 w-4" />
        ) : null}
      </div>
    </div>
  );
};
