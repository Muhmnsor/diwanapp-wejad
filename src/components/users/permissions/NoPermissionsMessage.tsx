
import { Button } from "@/components/ui/button";
import { Role } from "../types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";

interface NoPermissionsMessageProps {
  role: Role;
  onPermissionsAdded: () => void;
}

export const NoPermissionsMessage = ({ role, onPermissionsAdded }: NoPermissionsMessageProps) => {
  const { user } = useAuthStore();
  const isAdminOrDeveloper = user?.isAdmin || user?.role === 'developer';

  const addDefaultPermissions = async () => {
    try {
      // Get all permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id, name');
      
      if (permissionsError) throw permissionsError;
      
      // Create basic read permissions for all modules by default
      const readPermissions = permissions.filter(p => 
        p.name.includes('view_all') || 
        p.name.includes('_read') || 
        p.name === 'developer_access'
      );
      
      if (readPermissions.length === 0) {
        toast.error("لم يتم العثور على صلاحيات أساسية");
        return;
      }
      
      // Create role permissions
      const rolePermissions = readPermissions.map(p => ({
        role_id: role.id,
        permission_id: p.id
      }));
      
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);
      
      if (insertError) throw insertError;
      
      toast.success(`تم إضافة ${rolePermissions.length} صلاحية أساسية للدور`);
      onPermissionsAdded();
    } catch (error) {
      console.error("Error adding default permissions:", error);
      toast.error("حدث خطأ أثناء إضافة الصلاحيات الأساسية");
    }
  };
  
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 ml-2 text-amber-600" />
      <AlertDescription className="flex flex-col space-y-2">
        <p>لم يتم تعيين أي صلاحيات لهذا الدور بعد. المستخدمون بهذا الدور لن يتمكنوا من الوصول إلى معظم وظائف النظام.</p>
        
        {isAdminOrDeveloper && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 self-start border-amber-600 text-amber-700 hover:bg-amber-100"
            onClick={addDefaultPermissions}
          >
            إضافة الصلاحيات الأساسية
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
