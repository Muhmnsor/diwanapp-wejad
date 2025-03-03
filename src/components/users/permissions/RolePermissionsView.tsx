
import { ModuleCollapsible } from "./ModuleCollapsible";
import { Button } from "@/components/ui/button";
import { Role } from "../types";
import { usePermissions } from "./usePermissions";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";

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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          يرجى اختيار دور أولاً لعرض وتعديل الصلاحيات
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">صلاحيات الدور: {role.name}</h3>
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              حفظ الصلاحيات
            </>
          )}
        </Button>
      </div>

      {modules.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لا توجد صلاحيات متاحة حالياً
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCollapsible
              key={module.name}
              module={module}
              selectedPermissions={selectedPermissions}
              onPermissionToggle={handlePermissionToggle}
              onModuleToggle={() => handleModuleToggle(module)}
              toggleOpen={toggleModuleOpen}
            />
          ))}
        </div>
      )}
      
      <Toaster />
    </div>
  );
};
