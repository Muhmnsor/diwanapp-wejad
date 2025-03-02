
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Module } from "./types";
import { PermissionItem } from "./PermissionItem";

export interface ModuleCollapsibleProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (module: Module) => void;
  toggleOpen: (moduleName: string) => void;
}

export const ModuleCollapsible = ({
  module,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
  toggleOpen,
}: ModuleCollapsibleProps) => {
  const areAllSelected = module.permissions.every((permission) =>
    selectedPermissions.includes(permission.id)
  );

  const areSomeSelected =
    module.permissions.some((permission) =>
      selectedPermissions.includes(permission.id)
    ) && !areAllSelected;

  const handleModuleToggle = () => {
    onModuleToggle(module);
  };

  const handleToggleOpen = () => {
    toggleOpen(module.name);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-muted cursor-pointer"
        onClick={handleToggleOpen}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Checkbox
            id={`module-${module.name}`}
            checked={areAllSelected}
            onClick={(e) => {
              e.stopPropagation();
              handleModuleToggle();
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
      {module.isOpen && (
        <div className="p-4 space-y-2 bg-card">
          {module.permissions.map((permission) => (
            <PermissionItem
              key={permission.id}
              permission={permission}
              isChecked={selectedPermissions.includes(permission.id)}
              onToggle={onPermissionToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
