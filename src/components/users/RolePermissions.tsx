
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Role } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RolePermissionsProps {
  role: Role;
}

// تعريف نوع البيانات للتطبيقات والصلاحيات
interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Module {
  name: string;
  permissions: Permission[];
  isOpen: boolean;
}

export const RolePermissions = ({ role }: RolePermissionsProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استعلام للحصول على جميع الصلاحيات
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true });

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }

      return data as Permission[];
    }
  });

  // استعلام للحصول على صلاحيات الدور
  const { data: rolePermissions = [], refetch: refetchRolePermissions } = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      if (error) {
        console.error('Error fetching role permissions:', error);
        throw error;
      }

      return data.map(rp => rp.permission_id);
    },
    enabled: !!role.id
  });

  // تحديث حالة الصلاحيات المحددة عند تغير بيانات صلاحيات الدور
  useEffect(() => {
    if (rolePermissions.length > 0) {
      setSelectedPermissions(rolePermissions);
    }
  }, [rolePermissions]);

  // تنظيم الصلاحيات حسب الوحدات
  useEffect(() => {
    if (permissions.length > 0) {
      const moduleMap: { [key: string]: Permission[] } = {};
      
      // تجميع الصلاحيات حسب الوحدة
      permissions.forEach(permission => {
        if (!moduleMap[permission.module]) {
          moduleMap[permission.module] = [];
        }
        moduleMap[permission.module].push(permission);
      });
      
      // تحويل الخريطة إلى مصفوفة من الوحدات
      const moduleArray: Module[] = Object.keys(moduleMap).map(moduleName => ({
        name: moduleName,
        permissions: moduleMap[moduleName],
        isOpen: true // مفتوح افتراضيًا
      }));
      
      setModules(moduleArray);
    }
  }, [permissions]);

  // التحقق مما إذا كانت الصلاحية محددة
  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

  // التحقق مما إذا كانت جميع صلاحيات الوحدة محددة
  const areAllModulePermissionsSelected = (module: Module) => {
    return module.permissions.every(permission => isPermissionSelected(permission.id));
  };

  // تبديل حالة صلاحية واحدة
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // تبديل حالة جميع صلاحيات الوحدة
  const handleModuleToggle = (module: Module) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    
    if (areAllModulePermissionsSelected(module)) {
      // إلغاء تحديد جميع صلاحيات الوحدة
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // تحديد جميع صلاحيات الوحدة
      setSelectedPermissions(prev => {
        const newSelected = [...prev];
        modulePermissionIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  // تبديل حالة فتح/إغلاق الوحدة
  const toggleModuleOpen = (moduleName: string) => {
    setModules(prev => prev.map(m => 
      m.name === moduleName ? { ...m, isOpen: !m.isOpen } : m
    ));
  };

  // حفظ التغييرات
  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // حذف الصلاحيات الحالية للدور
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);
      
      if (deleteError) throw deleteError;
      
      // إذا كانت هناك صلاحيات محددة، أضفها
      if (selectedPermissions.length > 0) {
        const rolePemissions = selectedPermissions.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId
        }));
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePemissions);
        
        if (insertError) throw insertError;
      }
      
      toast.success("تم حفظ صلاحيات الدور بنجاح");
      refetchRolePermissions();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Collapsible 
            key={module.name}
            open={module.isOpen}
            onOpenChange={() => toggleModuleOpen(module.name)}
            className="border rounded-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={areAllModulePermissionsSelected(module)}
                  onCheckedChange={() => handleModuleToggle(module)}
                  id={`module-${module.name}`}
                />
                <label 
                  htmlFor={`module-${module.name}`}
                  className="text-base font-medium cursor-pointer"
                >
                  {module.name}
                </label>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {module.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              <div className="p-4 bg-background space-y-2 border-t">
                {module.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start gap-3 mr-6">
                    <Checkbox
                      id={permission.id}
                      checked={isPermissionSelected(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <div>
                      <label 
                        htmlFor={permission.id}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {permission.name}
                      </label>
                      {permission.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
