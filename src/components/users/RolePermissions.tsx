
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "./types";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RolePermissionsProps {
  role: Role;
}

interface AppModule {
  id: string;
  name: string;
  description: string;
  subPermissions?: SubPermission[];
}

interface SubPermission {
  id: string;
  name: string;
  description: string;
}

export const RolePermissions = ({ role }: RolePermissionsProps) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // قائمة الوحدات والتطبيقات المتاحة في النظام مع الصلاحيات التفصيلية
  const modules: AppModule[] = [
    { 
      id: "dashboard", 
      name: "لوحة المعلومات", 
      description: "عرض إحصائيات ومؤشرات النظام",
      subPermissions: [
        { id: "dashboard.view", name: "عرض الإحصائيات", description: "عرض إحصائيات النظام" },
        { id: "dashboard.export", name: "تصدير البيانات", description: "تصدير إحصائيات النظام" }
      ]
    },
    { 
      id: "users", 
      name: "إدارة المستخدمين", 
      description: "إضافة وتعديل وحذف المستخدمين",
      subPermissions: [
        { id: "users.view", name: "عرض المستخدمين", description: "عرض قائمة المستخدمين" },
        { id: "users.create", name: "إضافة مستخدمين", description: "إضافة مستخدمين جدد" },
        { id: "users.edit", name: "تعديل المستخدمين", description: "تعديل بيانات المستخدمين" },
        { id: "users.delete", name: "حذف المستخدمين", description: "حذف المستخدمين من النظام" },
        { id: "users.roles", name: "إدارة الأدوار", description: "إضافة وتعديل وحذف الأدوار والصلاحيات" }
      ]
    },
    { 
      id: "events", 
      name: "إدارة الفعاليات", 
      description: "إنشاء وتعديل الفعاليات",
      subPermissions: [
        { id: "events.view", name: "عرض الفعاليات", description: "عرض قائمة الفعاليات" },
        { id: "events.create", name: "إضافة فعاليات", description: "إنشاء فعاليات جديدة" },
        { id: "events.edit", name: "تعديل الفعاليات", description: "تعديل بيانات الفعاليات" },
        { id: "events.delete", name: "حذف الفعاليات", description: "حذف الفعاليات من النظام" },
        { id: "events.attendance", name: "إدارة الحضور", description: "تسجيل حضور المشاركين في الفعاليات" }
      ]
    },
    { 
      id: "projects", 
      name: "إدارة المشاريع", 
      description: "إنشاء وتعديل المشاريع",
      subPermissions: [
        { id: "projects.view", name: "عرض المشاريع", description: "عرض قائمة المشاريع" },
        { id: "projects.create", name: "إضافة مشاريع", description: "إنشاء مشاريع جديدة" },
        { id: "projects.edit", name: "تعديل المشاريع", description: "تعديل بيانات المشاريع" },
        { id: "projects.delete", name: "حذف المشاريع", description: "حذف المشاريع من النظام" },
        { id: "projects.activities", name: "إدارة الأنشطة", description: "إدارة أنشطة المشاريع" }
      ]
    },
    { 
      id: "reports", 
      name: "التقارير", 
      description: "إنشاء وعرض التقارير",
      subPermissions: [
        { id: "reports.view", name: "عرض التقارير", description: "عرض التقارير المتاحة" },
        { id: "reports.create", name: "إنشاء تقارير", description: "إنشاء تقارير جديدة" },
        { id: "reports.export", name: "تصدير التقارير", description: "تصدير التقارير بتنسيقات مختلفة" }
      ]
    },
    { 
      id: "finance", 
      name: "الإدارة المالية", 
      description: "إدارة الموارد المالية والمصروفات",
      subPermissions: [
        { id: "finance.view", name: "عرض البيانات المالية", description: "عرض البيانات المالية" },
        { id: "finance.resources", name: "إدارة الموارد", description: "إدارة الموارد المالية" },
        { id: "finance.expenses", name: "إدارة المصروفات", description: "إدارة المصروفات والنفقات" },
        { id: "finance.targets", name: "إدارة المستهدفات", description: "إدارة المستهدفات المالية" },
        { id: "finance.reports", name: "تقارير مالية", description: "عرض وتصدير التقارير المالية" }
      ]
    },
    { 
      id: "certificates", 
      name: "الشهادات", 
      description: "إصدار وإدارة الشهادات",
      subPermissions: [
        { id: "certificates.view", name: "عرض الشهادات", description: "عرض الشهادات المصدرة" },
        { id: "certificates.issue", name: "إصدار الشهادات", description: "إصدار شهادات جديدة" },
        { id: "certificates.templates", name: "إدارة القوالب", description: "إدارة قوالب الشهادات" },
        { id: "certificates.verify", name: "التحقق من الشهادات", description: "التحقق من صحة الشهادات" }
      ]
    },
    { 
      id: "settings", 
      name: "الإعدادات", 
      description: "تعديل إعدادات النظام",
      subPermissions: [
        { id: "settings.view", name: "عرض الإعدادات", description: "عرض إعدادات النظام" },
        { id: "settings.edit", name: "تعديل الإعدادات", description: "تعديل إعدادات النظام" },
        { id: "settings.notifications", name: "إعدادات الإشعارات", description: "إدارة إعدادات الإشعارات" },
        { id: "settings.whatsapp", name: "إعدادات واتساب", description: "إدارة إعدادات واتساب" },
        { id: "settings.backup", name: "النسخ الاحتياطي", description: "إدارة النسخ الاحتياطي للبيانات" }
      ]
    }
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

  // التحكم في توسيع/طي التفاصيل
  const toggleModule = (moduleId: string) => {
    if (openModules.includes(moduleId)) {
      setOpenModules(openModules.filter(id => id !== moduleId));
    } else {
      setOpenModules([...openModules, moduleId]);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    
    if (module?.subPermissions) {
      if (selectedModules.includes(moduleId)) {
        // إزالة الوحدة وجميع الصلاحيات الفرعية الخاصة بها
        const subPermissionIds = module.subPermissions.map(sp => sp.id);
        setSelectedModules(prev => 
          prev.filter(id => id !== moduleId && !subPermissionIds.includes(id))
        );
      } else {
        // إضافة الوحدة وجميع الصلاحيات الفرعية الخاصة بها
        const subPermissionIds = module.subPermissions.map(sp => sp.id);
        setSelectedModules(prev => 
          [...prev.filter(id => !id.startsWith(`${moduleId}.`)), moduleId, ...subPermissionIds]
        );
      }
    } else {
      // للمكونات التي ليس لها صلاحيات فرعية
      setSelectedModules(prev => 
        prev.includes(moduleId)
          ? prev.filter(id => id !== moduleId)
          : [...prev, moduleId]
      );
    }
  };

  const handleToggleSubPermission = (permissionId: string, moduleId: string) => {
    setSelectedModules(prev => {
      const newSelected = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId];
      
      // تحقق مما إذا كانت جميع الصلاحيات الفرعية محددة
      const module = modules.find(m => m.id === moduleId);
      if (module?.subPermissions) {
        const allSubPermissionIds = module.subPermissions.map(sp => sp.id);
        const selectedSubPermissions = newSelected.filter(id => allSubPermissionIds.includes(id));
        
        // إذا كانت جميع الصلاحيات الفرعية محددة، قم بإضافة الوحدة الرئيسية
        if (selectedSubPermissions.length === allSubPermissionIds.length && !newSelected.includes(moduleId)) {
          return [...newSelected, moduleId];
        }
        
        // إذا لم تكن جميع الصلاحيات الفرعية محددة، قم بإزالة الوحدة الرئيسية
        if (selectedSubPermissions.length < allSubPermissionIds.length && newSelected.includes(moduleId)) {
          return newSelected.filter(id => id !== moduleId);
        }
      }
      
      return newSelected;
    });
  };

  const areAllSubPermissionsSelected = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module?.subPermissions) return false;
    
    const subPermissionIds = module.subPermissions.map(sp => sp.id);
    return subPermissionIds.every(id => selectedModules.includes(id));
  };

  const areSomeSubPermissionsSelected = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module?.subPermissions) return false;
    
    const subPermissionIds = module.subPermissions.map(sp => sp.id);
    return subPermissionIds.some(id => selectedModules.includes(id)) && !areAllSubPermissionsSelected(moduleId);
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
    <Card dir="rtl">
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
                <div key={module.id} className="space-y-1 border rounded-md p-3">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id={`module-${module.id}`}
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={() => handleToggleModule(module.id)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none w-full">
                      <div className="flex justify-between items-center w-full">
                        <label
                          htmlFor={`module-${module.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {module.name}
                        </label>
                        
                        {module.subPermissions && module.subPermissions.length > 0 && (
                          <CollapsibleTrigger asChild onClick={() => toggleModule(module.id)}>
                            <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                              {openModules.includes(module.id) ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  {module.subPermissions && module.subPermissions.length > 0 && (
                    <Collapsible open={openModules.includes(module.id)}>
                      <CollapsibleContent>
                        <div className="space-y-2 mr-8 mt-3 border-r pr-2 border-gray-200">
                          {module.subPermissions.map((subPermission) => (
                            <div key={subPermission.id} className="flex items-start space-x-2 rtl:space-x-reverse">
                              <Checkbox
                                id={`permission-${subPermission.id}`}
                                checked={selectedModules.includes(subPermission.id)}
                                onCheckedChange={() => handleToggleSubPermission(subPermission.id, module.id)}
                              />
                              <div className="grid gap-1 leading-none">
                                <label
                                  htmlFor={`permission-${subPermission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {subPermission.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {subPermission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
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
