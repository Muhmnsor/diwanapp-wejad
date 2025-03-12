
import { useState, useEffect } from "react";
import { Role } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    name: "إدارة المستندات",
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
    name: "إدارة الأموال",
    key: "finance",
    description: "إدارة الميزانية والمصروفات"
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
    description: "إدارة المنتجات والطلبات في المتجر الإلكتروني"
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
  }
];

interface AppPermissionsManagerProps {
  role: Role;
}

export const AppPermissionsManager = ({ role }: AppPermissionsManagerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appPermissions, setAppPermissions] = useState<Record<string, boolean>>({});

  // Fetch current app permissions for the role
  useEffect(() => {
    const fetchAppPermissions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('app_permissions')
          .select('app_name')
          .eq('role_id', role.id);

        if (error) throw error;

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
        console.error('Error fetching app permissions:', error);
        toast.error('حدث خطأ أثناء تحميل صلاحيات التطبيقات');
      } finally {
        setIsLoading(false);
      }
    };

    if (role?.id) {
      fetchAppPermissions();
    }
  }, [role]);

  // Toggle app permission
  const handleToggleAppPermission = async (appKey: string, enabled: boolean) => {
    // Update local state immediately for better UX
    setAppPermissions(prev => ({
      ...prev,
      [appKey]: enabled
    }));

    setIsSaving(true);
    try {
      if (enabled) {
        // Add permission
        const { error } = await supabase
          .from('app_permissions')
          .insert({
            role_id: role.id,
            app_name: appKey
          });

        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from('app_permissions')
          .delete()
          .eq('role_id', role.id)
          .eq('app_name', appKey);

        if (error) throw error;
      }
      toast.success(`تم ${enabled ? 'منح' : 'إلغاء'} الوصول إلى ${AVAILABLE_APPS.find(app => app.key === appKey)?.name}`);
    } catch (error) {
      console.error('Error updating app permission:', error);
      toast.error('حدث خطأ أثناء تحديث صلاحيات التطبيق');
      
      // Revert local state on error
      setAppPermissions(prev => ({
        ...prev,
        [appKey]: !enabled
      }));
    } finally {
      setIsSaving(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>صلاحيات الوصول للتطبيقات</CardTitle>
        <CardDescription>تحديد التطبيقات التي يمكن للمستخدمين ذوي هذا الدور الوصول إليها</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {AVAILABLE_APPS.map((app) => (
            <div key={app.key} className="flex items-center justify-between border-b pb-3">
              <div>
                <Label htmlFor={`app-${app.key}`} className="text-base font-medium">{app.name}</Label>
                <p className="text-sm text-muted-foreground">{app.description}</p>
              </div>
              <Switch 
                id={`app-${app.key}`}
                checked={appPermissions[app.key] || false}
                onCheckedChange={(checked) => handleToggleAppPermission(app.key, checked)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
