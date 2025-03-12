
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "../types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define app information type
interface AppInfo {
  key: string;
  displayName: string;
  description: string;
}

// List of all apps with their info
const APPS: AppInfo[] = [
  { key: 'events', displayName: 'إدارة الفعاليات', description: 'إدارة وتنظيم الفعاليات والأنشطة' },
  { key: 'documents', displayName: 'إدارة المستندات', description: 'إدارة وتنظيم المستندات والملفات' },
  { key: 'tasks', displayName: 'إدارة المهام', description: 'إدارة وتتبع المهام والمشاريع' },
  { key: 'ideas', displayName: 'إدارة الأفكار', description: 'إدارة وتنظيم الأفكار والمقترحات' },
  { key: 'finance', displayName: 'إدارة الأموال', description: 'إدارة الميزانية والمصروفات' },
  { key: 'users', displayName: 'إدارة المستخدمين', description: 'إدارة حسابات المستخدمين والصلاحيات' },
  { key: 'website', displayName: 'الموقع الإلكتروني', description: 'إدارة وتحديث محتوى الموقع الإلكتروني' },
  { key: 'store', displayName: 'المتجر الإلكتروني', description: 'إدارة المنتجات والطلبات في المتجر الإلكتروني' },
  { key: 'notifications', displayName: 'الإشعارات', description: 'عرض وإدارة إشعارات النظام' },
  { key: 'requests', displayName: 'إدارة الطلبات', description: 'إدارة ومتابعة الطلبات والاستمارات والاعتمادات' },
  { key: 'developer', displayName: 'المطورين', description: 'إعدادات وأدوات المطورين' },
];

interface AppPermissionsManagerProps {
  role: Role;
  onChange?: (apps: string[]) => void;
}

export const AppPermissionsManager: React.FC<AppPermissionsManagerProps> = ({ role, onChange }) => {
  const [enabledApps, setEnabledApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load app permissions for this role
  useEffect(() => {
    const loadAppPermissions = async () => {
      if (!role?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('app_permissions')
          .select('app_name')
          .eq('role_id', role.id);

        if (error) throw error;

        // Set enabled apps from data
        setEnabledApps(data.map(item => item.app_name));
      } catch (error) {
        console.error('Error loading app permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppPermissions();
  }, [role?.id]);

  // Handle toggling app permission
  const handleToggleApp = async (appKey: string) => {
    setIsSaving(true);
    
    try {
      // Update local state first for immediate feedback
      const newEnabledApps = enabledApps.includes(appKey)
        ? enabledApps.filter(app => app !== appKey)
        : [...enabledApps, appKey];
        
      setEnabledApps(newEnabledApps);
      
      // If removing access, delete the permission record
      if (enabledApps.includes(appKey)) {
        await supabase
          .from('app_permissions')
          .delete()
          .eq('role_id', role.id)
          .eq('app_name', appKey);
      } 
      // If adding access, insert a new permission record
      else {
        await supabase
          .from('app_permissions')
          .insert({
            role_id: role.id,
            app_name: appKey
          });
      }
      
      // Notify parent of change if callback exists
      if (onChange) {
        onChange(newEnabledApps);
      }
    } catch (error) {
      console.error('Error toggling app permission:', error);
      
      // Revert local state on error
      const { data } = await supabase
        .from('app_permissions')
        .select('app_name')
        .eq('role_id', role.id);
        
      if (data) {
        setEnabledApps(data.map(item => item.app_name));
      }
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
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">صلاحيات الوصول للتطبيقات</CardTitle>
        <CardDescription>
          تحديد التطبيقات التي يمكن لهذا الدور الوصول إليها
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {APPS.map((app) => (
            <div key={app.key} className="flex items-center justify-between p-2 border rounded hover:bg-muted/20">
              <div>
                <h3 className="font-medium">{app.displayName}</h3>
                <p className="text-sm text-muted-foreground">{app.description}</p>
              </div>
              <Switch
                checked={enabledApps.includes(app.key)}
                onCheckedChange={() => handleToggleApp(app.key)}
                disabled={isSaving}
              />
            </div>
          ))}

          {APPS.length === 0 && (
            <div className="text-center p-4 border rounded bg-muted/10">
              لا توجد تطبيقات متاحة للتكوين
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
