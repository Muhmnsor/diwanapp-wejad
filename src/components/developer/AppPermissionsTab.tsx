
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/refactored-auth";

interface AppPermission {
  id: string;
  name: string;
  description: string;
  isAssigned: boolean;
}

export function AppPermissionsTab() {
  const { user } = useAuthStore();
  const [roleId, setRoleId] = useState<string | null>(null);

  // Fetch developer role ID
  useEffect(() => {
    const fetchDeveloperRoleId = async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'developer')
        .single();
        
      if (error) {
        console.error('Error fetching developer role:', error);
        return;
      }
      
      if (data) {
        setRoleId(data.id);
      }
    };
    
    fetchDeveloperRoleId();
  }, []);

  // Fetch permissions with assigned status
  const { data: appPermissions, isLoading, error, refetch } = useQuery({
    queryKey: ['app-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      // Get all app visibility permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .eq('module', 'apps_visibility');
        
      if (permissionsError) {
        throw permissionsError;
      }
      
      // Get assigned permissions for the developer role
      const { data: rolePermissions, error: rolePermissionsError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);
        
      if (rolePermissionsError) {
        throw rolePermissionsError;
      }
      
      // Create an array of assigned permission IDs
      const assignedPermissionIds = rolePermissions.map(rp => rp.permission_id);
      
      // Map permissions with assigned status
      const mappedPermissions: AppPermission[] = permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isAssigned: assignedPermissionIds.includes(p.id)
      }));
      
      return mappedPermissions;
    },
    enabled: !!roleId
  });

  const handlePermissionToggle = async (permissionId: string, isChecked: boolean) => {
    if (!roleId) return;
    
    try {
      if (isChecked) {
        // Add permission to role
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: roleId, permission_id: permissionId });
          
        if (error) throw error;
        toast.success('تم إضافة الصلاحية بنجاح');
      } else {
        // Remove permission from role
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);
          
        if (error) throw error;
        toast.success('تم إزالة الصلاحية بنجاح');
      }
      
      // Refetch permissions to update UI
      refetch();
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('حدث خطأ أثناء تحديث الصلاحية');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل صلاحيات التطبيقات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-destructive mr-2" />
          <h3 className="font-medium text-destructive">حدث خطأ أثناء تحميل الصلاحيات</h3>
        </div>
        <p className="text-sm text-destructive/80 mt-2">
          يرجى تحديث الصفحة والمحاولة مرة أخرى.
        </p>
      </div>
    );
  }

  const getAppNameFromPermission = (permissionName: string) => {
    // Extract app name from permission name (view_xxx_app -> xxx)
    const match = permissionName.match(/view_(.+)_app/);
    return match ? match[1] : '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة صلاحيات التطبيقات</CardTitle>
        <CardDescription>
          تحكم في التطبيقات المرئية للمستخدمين في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appPermissions?.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Checkbox 
                  id={permission.id} 
                  checked={permission.isAssigned}
                  onCheckedChange={(checked) => {
                    handlePermissionToggle(permission.id, checked === true);
                  }}
                />
                <div>
                  <label 
                    htmlFor={permission.id} 
                    className="font-medium cursor-pointer"
                  >
                    {permission.description || permission.name}
                  </label>
                  <Badge variant="outline" className="mr-2">
                    {getAppNameFromPermission(permission.name)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {(!appPermissions || appPermissions.length === 0) && (
            <div className="text-center p-8 text-muted-foreground">
              لا توجد صلاحيات تطبيقات متاحة
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
