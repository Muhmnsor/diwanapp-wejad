
import { Role } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NoPermissionsMessageProps {
  role: Role;
  onPermissionsAdded: () => void;
}

export const NoPermissionsMessage = ({ role, onPermissionsAdded }: NoPermissionsMessageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDefaultPermissions = async () => {
    setIsLoading(true);
    try {
      // Get basic permissions (for now we're adding read access to all modules)
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('id, module')
        .or('name.ilike.%read%,name.ilike.%view%,name.ilike.%access%')
        .limit(50);
      
      if (permissionsError) throw permissionsError;
      
      if (!permissions || permissions.length === 0) {
        toast.error("لم يتم العثور على أي صلاحيات أساسية");
        return;
      }

      // Insert basic permissions for this role
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(
          permissions.map(permission => ({
            role_id: role.id,
            permission_id: permission.id
          }))
        );
      
      if (insertError) throw insertError;

      // Add basic app permissions
      const appPermissions = [
        { role_id: role.id, app_name: 'events' },
        { role_id: role.id, app_name: 'documents' },
        { role_id: role.id, app_name: 'tasks' }
      ];

      const { error: appError } = await supabase
        .from('app_permissions')
        .insert(appPermissions);
      
      if (appError) {
        console.error("Error adding app permissions:", appError);
        // Continue even if app permissions fail
      }

      toast.success("تم إضافة الصلاحيات الأساسية بنجاح");
      onPermissionsAdded();
    } catch (error) {
      console.error("Error adding default permissions:", error);
      toast.error("حدث خطأ أثناء إضافة الصلاحيات الأساسية");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6 space-y-4 text-center">
        <Info className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="text-lg font-medium">لا توجد صلاحيات معينة لهذا الدور</h3>
        <p className="text-muted-foreground">
          دون تعيين الصلاحيات، لن يتمكن المستخدمون من الوصول إلى التطبيقات أو أداء أي مهام. 
          يمكنك إضافة الصلاحيات يدويًا أو إضافة مجموعة الصلاحيات الأساسية تلقائيًا.
        </p>
        <Button 
          onClick={handleAddDefaultPermissions} 
          disabled={isLoading} 
          className="mt-2"
        >
          {isLoading ? "جاري الإضافة..." : "إضافة الصلاحيات الأساسية"}
        </Button>
      </CardContent>
    </Card>
  );
};
