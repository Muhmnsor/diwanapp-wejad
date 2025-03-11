
import { Module } from "./types";
import { ModuleHeader } from "./components/ModuleHeader";
import { ModulePermissionsContent } from "./components/ModulePermissionsContent";
import { getModuleDisplayName } from "./utils/moduleMapping";

export interface ModuleCollapsibleProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (moduleName: string) => void;
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

  const moduleDisplayName = getModuleDisplayName(module.name);

  return (
    <div className="border rounded-md overflow-hidden mb-4">
      <ModuleHeader
        moduleName={module.name}
        moduleDisplayName={moduleDisplayName}
        areAllSelected={areAllSelected}
        areSomeSelected={areSomeSelected}
        onModuleToggle={() => onModuleToggle(module.name)}
        onToggleOpen={() => toggleOpen(module.name)}
        isOpen={module.isOpen}
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
