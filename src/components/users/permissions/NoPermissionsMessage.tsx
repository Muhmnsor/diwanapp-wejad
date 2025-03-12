
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import { Role } from "../types";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MODULE_TRANSLATIONS } from "./types";

interface NoPermissionsMessageProps {
  role: Role;
  onPermissionsAdded: () => void;
}

export const NoPermissionsMessage = ({ role, onPermissionsAdded }: NoPermissionsMessageProps) => {
  const [isAddingPermissions, setIsAddingPermissions] = useState(false);

  const addDefaultPermissions = async () => {
    setIsAddingPermissions(true);
    try {
      // Get all available permissions
      const { data: allPermissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id, name, module');

      if (permissionsError) {
        throw permissionsError;
      }

      // Group permissions by module for better organization
      const permissionsByModule: Record<string, { id: string; name: string; }[]> = {};
      
      allPermissions.forEach(permission => {
        // Use Arabic module names consistently
        const moduleName = permission.module;
        
        if (!permissionsByModule[moduleName]) {
          permissionsByModule[moduleName] = [];
        }
        permissionsByModule[moduleName].push(permission);
      });

      // Add basic read permissions for each module and full permissions for users module
      const permissionsToAdd = [];
      
      // For the users module (المستخدمين), add all permissions
      const userModuleKey = 'المستخدمين';
      if (permissionsByModule[userModuleKey]) {
        permissionsByModule[userModuleKey].forEach(permission => {
          permissionsToAdd.push({
            role_id: role.id,
            permission_id: permission.id
          });
        });
      }
      
      // For other modules, add only read permissions
      Object.entries(permissionsByModule).forEach(([moduleName, modulePermissions]) => {
        if (moduleName !== userModuleKey) {
          // Find permissions with 'view' or 'read' in their name
          const readPermissions = modulePermissions.filter(
            p => p.name.includes('view') || p.name.includes('read')
          );
          
          readPermissions.forEach(permission => {
            permissionsToAdd.push({
              role_id: role.id,
              permission_id: permission.id
            });
          });
        }
      });

      // Add the permissions
      if (permissionsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(permissionsToAdd);

        if (insertError) throw insertError;
      }

      // Add basic app permissions for all major apps
      const appPermissions = [
        { role_id: role.id, app_name: 'users' }, // المستخدمين
        { role_id: role.id, app_name: 'events' }, // الفعاليات
        { role_id: role.id, app_name: 'tasks' }, // المهام
        { role_id: role.id, app_name: 'documents' }, // المستندات
      ];

      const { error: appError } = await supabase
        .from('app_permissions')
        .insert(appPermissions);

      if (appError) throw appError;

      toast.success("تم إضافة الصلاحيات الافتراضية بنجاح");
      onPermissionsAdded();
    } catch (error) {
      console.error("Error adding default permissions:", error);
      toast.error("حدث خطأ أثناء إضافة الصلاحيات الافتراضية");
    } finally {
      setIsAddingPermissions(false);
    }
  };

  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          لا توجد صلاحيات محددة
        </CardTitle>
        <CardDescription>
          لم يتم تحديد أي صلاحيات لهذا الدور بعد. يمكنك إضافة الصلاحيات الافتراضية أو تحديد الصلاحيات يدويًا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={addDefaultPermissions}
          disabled={isAddingPermissions}
          className="w-full"
        >
          {isAddingPermissions ? (
            <>
              جاري إضافة الصلاحيات...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              إضافة الصلاحيات الافتراضية
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
