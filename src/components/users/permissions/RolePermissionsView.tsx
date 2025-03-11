
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "../types";
import { ModuleCollapsible } from "./ModuleCollapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PermissionData, Module } from "./types";

interface RolePermissionsViewProps {
  role: Role;
}

export const RolePermissionsView = ({ role }: RolePermissionsViewProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch permissions data
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .order('module');

        if (error) throw error;
        return data as PermissionData[];
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('حدث خطأ أثناء تحميل الصلاحيات');
        return [];
      }
    }
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: isLoadingRolePermissions, refetch: refetchRolePermissions } = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', role.id);

        if (error) throw error;
        return data.map(item => item.permission_id);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        toast.error('حدث خطأ أثناء تحميل صلاحيات الدور');
        return [];
      }
    },
    enabled: !!role?.id
  });

  // Organize permissions into modules
  useEffect(() => {
    if (permissions) {
      const moduleMap = new Map<string, PermissionData[]>();
      
      permissions.forEach(permission => {
        if (!moduleMap.has(permission.module)) {
          moduleMap.set(permission.module, []);
        }
        moduleMap.get(permission.module)?.push(permission);
      });
      
      const modulesArray: Module[] = Array.from(moduleMap.entries()).map(([name, perms]) => ({
        name,
        permissions: perms,
        isOpen: true // Default open state
      }));
      
      setModules(modulesArray);
    }
  }, [permissions]);

  // Set selected permissions when role permissions are loaded
  useEffect(() => {
    if (rolePermissions) {
      console.log('Setting selected permissions:', rolePermissions);
      setSelectedPermissions(rolePermissions);
    }
  }, [rolePermissions]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    console.log('Toggling permission:', permissionId, 'Current state:', selectedPermissions.includes(permissionId));
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Handle module toggle (select/deselect all permissions in a module)
  const handleModuleToggle = (moduleName: string) => {
    const modulePermissions = modules.find(m => m.name === moduleName)?.permissions || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);
    
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all in this module
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all in this module
      const newSelected = [...selectedPermissions];
      modulePermissionIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedPermissions(newSelected);
    }
  };

  // Toggle module open/closed state
  const toggleModuleOpen = (moduleName: string) => {
    setModules(prev => prev.map(module => 
      module.name === moduleName
        ? { ...module, isOpen: !module.isOpen }
        : module
    ));
  };

  // Filter modules based on search query
  const filteredModules = modules.map(module => ({
    ...module,
    permissions: module.permissions.filter(permission => 
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(module => module.permissions.length > 0);

  // Save role permissions
  const handleSave = async () => {
    if (!role.id) return;
    
    setIsSaving(true);
    try {
      // Delete existing role permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);
      
      if (deleteError) throw deleteError;
      
      // Insert new role permissions
      if (selectedPermissions.length > 0) {
        const rolePerm = selectedPermissions.map(permId => ({
          role_id: role.id,
          permission_id: permId
        }));
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePerm);
        
        if (insertError) throw insertError;
      }
      
      toast.success('تم حفظ صلاحيات الدور بنجاح');
      refetchRolePermissions();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error('حدث خطأ أثناء حفظ صلاحيات الدور');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingRolePermissions) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="mr-2">جاري تحميل الصلاحيات...</span>
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <Alert>
        <ShieldAlert className="h-4 w-4 ml-2" />
        <AlertDescription>
          لا توجد صلاحيات متاحة حالياً في النظام
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الصلاحيات..."
            className="pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="mr-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ الصلاحيات
            </>
          )}
        </Button>
      </div>
      
      {filteredModules.length === 0 ? (
        <div className="text-center p-4 bg-muted/20 rounded-md">
          لا توجد نتائج تطابق بحثك
        </div>
      ) : (
        filteredModules.map((module) => (
          <ModuleCollapsible
            key={module.name}
            module={module}
            selectedPermissions={selectedPermissions}
            onPermissionToggle={handlePermissionToggle}
            onModuleToggle={handleModuleToggle}
            toggleOpen={toggleModuleOpen}
          />
        ))
      )}
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ الصلاحيات
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
