
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ModuleCollapsible } from "./ModuleCollapsible";
import { Role } from "../types";
import { usePermissions } from "./usePermissions";

interface RolePermissionsViewProps {
  role: Role;
}

export const RolePermissionsView = ({ role }: RolePermissionsViewProps) => {
  const {
    modules,
    selectedPermissions,
    isLoading,
    isSubmitting,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    handleSave
  } = usePermissions(role);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الصلاحيات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">صلاحيات الدور: {role.name}</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : 'حفظ الصلاحيات'}
        </Button>
      </div>

      <div className="space-y-2">
        {modules.map((module) => (
          <ModuleCollapsible
            key={module.name}
            module={module}
            selectedPermissions={selectedPermissions}
            onPermissionToggle={handlePermissionToggle}
            onModuleToggle={handleModuleToggle}
            toggleOpen={toggleModuleOpen}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center p-8 border rounded-md bg-muted">
          لا توجد صلاحيات متاحة لهذا الدور
        </div>
      )}
    </div>
  );
};
