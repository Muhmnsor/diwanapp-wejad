
import { Button } from "@/components/ui/button";
import { Role } from "../types";
import { ModuleCollapsible } from "./ModuleCollapsible";
import { usePermissions } from "./usePermissions";

interface RolePermissionsViewProps {
  role: Role;
}

export const RolePermissionsView = ({ role }: RolePermissionsViewProps) => {
  const {
    modules,
    selectedPermissions,
    isLoading,
    permissions,
    isSubmitting,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    handleSave
  } = usePermissions(role);

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">جاري تحميل الصلاحيات...</p>
      </div>
    );
  }

  // إذا لم تكن هناك صلاحيات، أظهر رسالة
  if (permissions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">لم يتم العثور على صلاحيات معرفة في النظام.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-muted/20 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">صلاحيات دور: {role.name}</h3>
        <p className="text-muted-foreground text-sm">{role.description || "لا يوجد وصف"}</p>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <ModuleCollapsible
            key={module.name}
            module={module}
            selectedPermissions={selectedPermissions}
            onPermissionToggle={handlePermissionToggle}
            onModuleToggle={handleModuleToggle}
            toggleModuleOpen={toggleModuleOpen}
          />
        ))}
      </div>

      <div className="flex justify-start pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ الصلاحيات"}
        </Button>
      </div>
    </div>
  );
};
