
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "./types";
import { Loader2 } from "lucide-react";

interface RolePermissionsProps {
  role: Role;
}

interface AppModule {
  id: string;
  name: string;
  description: string;
}

export const RolePermissions = ({ role }: RolePermissionsProps) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قائمة الوحدات والتطبيقات المتاحة في النظام
  const modules: AppModule[] = [
    { id: "dashboard", name: "لوحة المعلومات", description: "عرض إحصائيات ومؤشرات النظام" },
    { id: "users", name: "إدارة المستخدمين", description: "إضافة وتعديل وحذف المستخدمين" },
    { id: "events", name: "إدارة الفعاليات", description: "إنشاء وتعديل الفعاليات" },
    { id: "projects", name: "إدارة المشاريع", description: "إنشاء وتعديل المشاريع" },
    { id: "reports", name: "التقارير", description: "إنشاء وعرض التقارير" },
    { id: "finance", name: "الإدارة المالية", description: "إدارة الموارد المالية والمصروفات" },
    { id: "certificates", name: "الشهادات", description: "إصدار وإدارة الشهادات" },
    { id: "settings", name: "الإعدادات", description: "تعديل إعدادات النظام" }
  ];

  // جلب الصلاحيات الحالية للدور المحدد
  const { data: permissions, isLoading, refetch } = useQuery({
    queryKey: ['role-permissions', role.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_permissions')
        .select('app_name')
        .eq('role_id', role.id);
      
      if (error) throw error;
      return data.map(p => p.app_name);
    }
  });

  // تحديث قائمة التطبيقات المحددة عند تغيير بيانات الصلاحيات
  useEffect(() => {
    if (permissions) {
      setSelectedModules(permissions);
    }
  }, [permissions]);

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSavePermissions = async () => {
    setIsSubmitting(true);
    try {
      // حذف جميع الصلاحيات الحالية للدور
      await supabase
        .from('app_permissions')
        .delete()
        .eq('role_id', role.id);
      
      // إضافة الصلاحيات الجديدة
      if (selectedModules.length > 0) {
        const permissionsToInsert = selectedModules.map(appName => ({
          role_id: role.id,
          app_name: appName
        }));
        
        const { error } = await supabase
          .from('app_permissions')
          .insert(permissionsToInsert);
        
        if (error) throw error;
      }

      // تسجيل نشاط المستخدم
      await supabase.rpc('log_user_activity', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: 'permissions_update',
        details: `تم تحديث صلاحيات الدور: ${role.name}`
      });

      toast.success("تم حفظ الصلاحيات بنجاح");
      refetch();
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">صلاحيات الدور: {role.name}</CardTitle>
        <CardDescription>
          حدد الوحدات والتطبيقات التي يمكن لهذا الدور الوصول إليها
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleToggleModule(module.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`module-${module.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {module.name}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSavePermissions} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "جار الحفظ..." : "حفظ الصلاحيات"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
