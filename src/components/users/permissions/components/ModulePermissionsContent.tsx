
import { Category, Module, PermissionData } from "../types";
import { PermissionItem } from "../PermissionItem";

interface ModulePermissionsContentProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
}

export const ModulePermissionsContent = ({
  module,
  selectedPermissions,
  onPermissionToggle,
}: ModulePermissionsContentProps) => {
  // Check if we have categories
  const hasCategories = module.categories && module.categories.length > 0;

  if (hasCategories) {
    return (
      <div className="p-4 bg-background">
        {module.categories!.map((category) => (
          <div key={category.name} className="mb-4">
            <h4 className="text-sm font-medium mb-2">{category.displayName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.permissions.map((permission) => (
                <PermissionItem
                  key={permission.id}
                  permission={permission}
                  isChecked={selectedPermissions.includes(permission.id)}
                  onToggle={onPermissionToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback to showing all permissions without categories
  return (
    <div className="p-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
  );
};
