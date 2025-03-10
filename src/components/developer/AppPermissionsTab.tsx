
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/refactored-auth";
import { PermissionData } from "@/components/users/permissions/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { permissionGroups, getModuleDisplayName } from "@/utils/developer/permissionsMapping";

export function AppPermissionsTab() {
  const { user } = useAuthStore();
  const [roleId, setRoleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

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
  const { data: permissions, isLoading, error, refetch } = useQuery({
    queryKey: ['app-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return {};
      
      // Get all permissions
      const { data: allPermissions, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('module');
        
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
      
      // Group permissions by module
      const groupedPermissions: Record<string, PermissionData[]> = {};
      
      allPermissions.forEach(permission => {
        const module = permission.module || 'other';
        
        if (!groupedPermissions[module]) {
          groupedPermissions[module] = [];
        }
        
        groupedPermissions[module].push({
          ...permission,
          isAssigned: assignedPermissionIds.includes(permission.id)
        });
      });
      
      return groupedPermissions;
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

  const toggleModule = (module: string) => {
    setExpandedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module) 
        : [...prev, module]
    );
  };

  const isModuleExpanded = (module: string) => expandedModules.includes(module);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة صلاحيات التطبيقات</CardTitle>
        <CardDescription>
          تحكم في التطبيقات وصلاحياتها المرئية للمستخدمين في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {permissions && Object.keys(permissions).map((module) => (
            <AccordionItem key={module} value={module} className="border rounded-md">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getModuleDisplayName(module)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({permissions[module].length} صلاحية)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-3">
                  {permissions[module].map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between border-b pb-2">
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
                            className="font-medium cursor-pointer text-sm"
                          >
                            {permission.description || permission.name}
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {(!permissions || Object.keys(permissions).length === 0) && (
          <div className="text-center p-8 text-muted-foreground">
            لا توجد صلاحيات تطبيقات متاحة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
