
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PermissionItem } from "./PermissionItem";
import { Module, Permission } from "./types";

interface ModuleCollapsibleProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (module: Module) => void;
  toggleModuleOpen: (moduleName: string) => void;
}

export const ModuleCollapsible = ({
  module,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
  toggleModuleOpen
}: ModuleCollapsibleProps) => {
  // التحقق مما إذا كانت جميع صلاحيات الوحدة محددة
  const areAllModulePermissionsSelected = () => {
    return module.permissions.every(permission => 
      selectedPermissions.includes(permission.id)
    );
  };

  return (
    <Collapsible 
      key={module.name}
      open={module.isOpen}
      onOpenChange={() => toggleModuleOpen(module.name)}
      className="border rounded-md overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={areAllModulePermissionsSelected()}
            onCheckedChange={() => onModuleToggle(module)}
            id={`module-${module.name}`}
          />
          <label 
            htmlFor={`module-${module.name}`}
            className="text-base font-medium cursor-pointer"
          >
            {module.name}
          </label>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {module.isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="p-4 bg-background space-y-2 border-t">
          {module.permissions.map((permission) => (
            <PermissionItem
              key={permission.id}
              permission={permission}
              isSelected={selectedPermissions.includes(permission.id)}
              onToggle={onPermissionToggle}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
