import { Module } from "../types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { useMergeRefs } from "@/lib/mergeRefs";

interface ModuleHeaderProps {
  module: Module;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  onModuleToggle: (module: Module) => void;
  onToggleOpen: () => void;
}

// Create a wrapper component for Checkbox that supports indeterminate state
const IndeterminateCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  React.ComponentPropsWithoutRef<typeof Checkbox> & { indeterminate?: boolean }
>((props, ref) => {
  const { indeterminate, ...rest } = props;
  const internalRef = React.useRef<HTMLButtonElement>(null);
  const combinedRef = useMergeRefs([ref, internalRef]);

  React.useEffect(() => {
    if (internalRef.current) {
      internalRef.current.dataset.state = indeterminate ? "indeterminate" : rest.checked ? "checked" : "unchecked";
      internalRef.current.setAttribute("aria-checked", indeterminate ? "mixed" : rest.checked ? "true" : "false");
    }
  }, [indeterminate, rest.checked]);

  return <Checkbox ref={combinedRef} {...rest} />;
});

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export const ModuleHeader = ({
  module,
  areAllSelected,
  areSomeSelected,
  onModuleToggle,
  onToggleOpen,
}: ModuleHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-background hover:bg-muted/30 cursor-pointer">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <IndeterminateCheckbox
          id={`module-${module.name}`}
          checked={areAllSelected}
          indeterminate={areSomeSelected}
          onCheckedChange={() => onModuleToggle(module)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="font-medium" onClick={() => onModuleToggle(module)}>
          {module.displayName || module.name}
          
          {module.permissions.length > 0 && (
            <span className="text-sm text-muted-foreground mr-2">
              ({module.permissions.length})
            </span>
          )}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggleOpen();
        }}
      >
        {module.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
    </div>
  );
};
