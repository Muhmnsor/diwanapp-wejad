
import { Module } from "./types";
import { ModuleHeader } from "./components/ModuleHeader";
import { ModulePermissionsContent } from "./components/ModulePermissionsContent";

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

  const handleToggleOpen = () => {
    toggleOpen(module.name);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <ModuleHeader
        module={module}
        areAllSelected={areAllSelected}
        areSomeSelected={areSomeSelected}
        onModuleToggle={onModuleToggle}
        onToggleOpen={handleToggleOpen}
      />
      
      {module.isOpen && (
        <ModulePermissionsContent
          permissions={module.permissions}
          selectedPermissions={selectedPermissions}
          onPermissionToggle={onPermissionToggle}
        />
      )}
    </div>
  );
};
