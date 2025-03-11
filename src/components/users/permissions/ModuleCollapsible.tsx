
import { Module } from "./types";
import { ModuleHeader } from "./components/ModuleHeader";
import { PermissionItem } from "./PermissionItem";
import { getModuleDisplayName } from "./utils/moduleMapping";

interface ModuleCollapsibleProps {
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
  const moduleDisplayName = getModuleDisplayName(module.name);
  
  // Calculate if all or some permissions in this module are selected
  const modulePermissionIds = module.permissions.map(p => p.id);
  const moduleSelectedCount = modulePermissionIds.filter(id => 
    selectedPermissions.includes(id)
  ).length;
  
  const areAllSelected = moduleSelectedCount === modulePermissionIds.length && modulePermissionIds.length > 0;
  const areSomeSelected = moduleSelectedCount > 0 && !areAllSelected;

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
        <div className="p-2 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {module.permissions.map((permission) => (
              <PermissionItem
                key={permission.id}
                permission={permission}
                isChecked={selectedPermissions.includes(permission.id)}
                onToggle={onPermissionToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
