
import { PermissionItem } from "../PermissionItem";
import { PermissionData, Module } from "../types";

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
  // Group permissions by categories if available
  const hasCategories = module.categories && module.categories.length > 0;
  
  if (hasCategories) {
    return (
      <div className="p-4 bg-muted/20 border-t">
        {module.categories?.map((category) => (
          <div key={category.name} className="mb-4 last:mb-0">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              {category.displayName}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  
  // If no categories, show flat list
  return (
    <div className="p-4 bg-muted/20 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
      {module.permissions.map((permission) => (
        <PermissionItem
          key={permission.id}
          permission={permission}
          isChecked={selectedPermissions.includes(permission.id)}
          onToggle={onPermissionToggle}
        />
      ))}
    </div>
  );
};
