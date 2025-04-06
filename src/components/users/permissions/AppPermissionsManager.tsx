
import { useState, useEffect, useCallback } from "react";
import { Role } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/refactored-auth";

// Define app information interface
interface AppInfo {
  name: string;
  key: string;
  description: string;
}

// List of available apps
const AVAILABLE_APPS: AppInfo[] = [
  {
    name: "إدارة الفعاليات",
    key: "events",
    description: "إدارة وتنظيم الفعاليات والأنشطة"
  },
  {
    name: "إدارة الوثائق",
    key: "documents",
    description: "إدارة وتنظيم المستندات والملفات"
  },
  {
    name: "إدارة المهام",
    key: "tasks",
    description: "إدارة وتتبع المهام والمشاريع"
  },
  {
    name: "إدارة الأفكار",
    key: "ideas",
    description: "إدارة وتنظيم الأفكار والمقترحات"
  },
  {
    name: "إدارة التقديرات",
    key: "finance",
    description: "إدارة تقديرات المشاريع"
  },
  {
    name: "إدارة المستخدمين",
    key: "users",
    description: "إدارة حسابات المستخدمين والصلاحيات"
  },
  {
    name: "الموقع الإلكتروني",
    key: "website",
    description: "إدارة وتحديث محتوى الموقع الإلكتروني"
  },
  {
    name: "المتجر الإلكتروني",
    key: "store",
    description: "إدارة منتجات التبرع في المتجر الإلكتروني"
  },
  {
    name: "الإشعارات",
    key: "notifications",
    description: "عرض وإدارة إشعارات النظام"
  },
  {
    name: "إدارة الطلبات",
    key: "requests",
    description: "إدارة ومتابعة الطلبات والاستمارات والاعتمادات"
  },
  {
    name: "المطورين",
    key: "developer",
    description: "إعدادات وأدوات المطورين"
  },
  // Adding the new applications
  {
    name: "إدارة شؤون الموظفين",
    key: "hr",
    description: "إدارة المعلومات والعمليات المتعلقة بالموظفين"
  },
  {
    name: "إدارة المحاسبة",
    key: "accounting",
    description: "إدارة الميزانية والشؤون المالية"
  },
  {
    name: "إدارة الاجتماعات",
    key: "meetings",
    description: "إدارة جدول الاجتماعات والمشاركين والمحاضر"
  },
  {
    name: "البريد الداخلي",
    key: "internal_mail",
    description: "نظام البريد الداخلي والمراسلات"
  },
  {
    name: "الاشتراكات",
    key: "subscriptions",
    description: "إدارة اشتراكات المستخدمين والمتابعين"
  }
];

interface AppPermissionsManagerProps {
  role: Role;
  onPermissionsChange?: () => void;
}

export const AppPermissionsManager = ({ role, onPermissionsChange }: AppPermissionsManagerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [appPermissions, setAppPermissions] = useState<Record<string, boolean>>({});
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  // Check if current user is admin or developer
  const isAdminOrDeveloper = user?.isAdmin || user?.role === 'developer';

  // Fetch current app permissions for the role
  const fetchAppPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('app_permissions')
        .select('app_name')
        .eq('role_id', role.id);

      if (error) {
        console.error('Error fetching app permissions:', error);
        setError(`حدث خطأ أثناء تحميل صلاحيات التطبيقات: ${error.message}`);
        toast.error('حدث خطأ أثناء تحميل صلاحيات التطبيقات');
        return;
      }

      // Convert to a map of app_name -> true
      const permissionsMap: Record<string, boolean> = {};
      AVAILABLE_APPS.forEach(app => {
        permissionsMap[app.key] = false;
      });

      data.forEach(perm => {
        permissionsMap[perm.app_name] = true;
      });

      setAppPermissions(permissionsMap);
    } catch (error) {
      console.error('Exception when fetching app permissions:', error);
      setError('حدث خطأ غير متوقع أثناء تحميل صلاحيات التطبيقات');
    } finally {
      setIsLoading(false);
    }
  }, [role.id]);

  useEffect(() => {
    if (role?.id) {
      fetchAppPermissions();
    }
  }, [role, fetchAppPermissions]);

  // Toggle app permission
  const handleToggleAppPermission = async (appKey: string, enabled: boolean) => {
    if (!isAdminOrDeveloper) {
      toast.error('ليس لديك صلاحية لتعديل صلاحيات التطبيقات');
      return;
    }

    // Update local state immediately for better UX
    setAppPermissions(prev => ({
      ...prev,
      [appKey]: enabled
    }));

    setIsSaving(appKey);
    try {
      if (enabled) {
        // Add permission
        const { error } = await supabase
          .from('app_permissions')
          .insert({
            role_id: role.id,
            app_name: appKey
          });

        if (error) {
          console.error('Error adding app permission:', error);
          throw new Error(error.message);
        }
      } else {
        // Remove permission
        const { error } = await supabase
          .from('app_permissions')
          .delete()
          .eq('role_id', role.id)
          .eq('app_name', appKey);

        if (error) {
          console.error('Error removing app permission:', error);
          throw new Error(error.message);
        }
      }
      toast.success(`تم ${enabled ? 'منح' : 'إلغاء'} الوصول إلى ${AVAILABLE_APPS.find(app => app.key === appKey)?.name}`);
      setHasSavedChanges(true);
      if (onPermissionsChange) {
        onPermissionsChange();
      }
    } catch (error: any) {
      console.error('Exception updating app permission:', error);
      toast.error(`حدث خطأ أثناء تحديث صلاحيات التطبيق: ${error.message}`);
      
      // Revert local state on error
      setAppPermissions(prev => ({
        ...prev,
        [appKey]: !enabled
      }));
    } finally {
      setIsSaving(null);
    }
  };

  const retryFetch = () => {
    fetchAppPermissions();
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
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert className="mb-4 bg-red-50">
            <Info className="h-4 w-4 ml-2 text-red-500" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={retryFetch} className="mt-4">إعادة المحاولة</Button>
        </CardContent>
      </Card>
    );
  }

  // Check if any app permissions are enabled
  const hasAnyAppPermissions = Object.values(appPermissions).some(enabled => enabled);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>صلاحيات الوصول للتطبيقات</CardTitle>
        <CardDescription>تحديد التطبيقات التي يمكن للمستخدمين ذوي هذا الدور الوصول إليها</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAnyAppPermissions && (
          <Alert className="mb-4 bg-amber-50">
            <Info className="h-4 w-4 ml-2" />
            <AlertDescription>
              لم يتم تمكين أي تطبيقات لهذا الدور. المستخدمون بهذا الدور لن يروا أي تطبيقات في لوحة التحكم.
            </AlertDescription>
          </Alert>
        )}

        {hasSavedChanges && (
          <Alert className="mb-4 bg-green-50">
            <Info className="h-4 w-4 ml-2" />
            <AlertDescription>
              تم حفظ التغييرات بنجاح. سيتم تحديث التطبيقات المرئية للمستخدمين ذوي هذا الدور.
            </AlertDescription>
          </Alert>
        )}

        {!isAdminOrDeveloper && (
          <Alert className="mb-4 bg-blue-50">
            <Info className="h-4 w-4 ml-2" />
            <AlertDescription>
              أنت في وضع العرض فقط. فقط المشرفون والمطورون يمكنهم تعديل صلاحيات التطبيقات.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {AVAILABLE_APPS.map((app) => (
            <div key={app.key} className="flex items-center justify-between border-b pb-3">
              <div>
                <Label htmlFor={`app-${app.key}`} className="text-base font-medium">{app.name}</Label>
                <p className="text-sm text-muted-foreground">{app.description}</p>
              </div>
              <div className="flex items-center">
                <Switch 
                  id={`app-${app.key}`}
                  checked={appPermissions[app.key] || false}
                  onCheckedChange={(checked) => handleToggleAppPermission(app.key, checked)}
                  disabled={isSaving === app.key || !isAdminOrDeveloper}
                />
                {isSaving === app.key && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
