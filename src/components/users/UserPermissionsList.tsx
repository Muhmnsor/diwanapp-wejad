
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Shield, CheckCircle2, XCircle } from "lucide-react";

interface Permission {
  id: string;
  app_name: string;
  role_id: string;
}

interface UserPermissionsListProps {
  userId: string;
  role: string;
}

export const UserPermissionsList = ({ userId, role }: UserPermissionsListProps) => {
  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      try {
        // This will be implemented properly with the app_permissions table
        // Currently mocking the data for UI development
        const mockPermissions = [
          { name: 'إدارة المستخدمين', hasAccess: role === 'admin' },
          { name: 'إدارة الفعاليات', hasAccess: role === 'admin' || role === 'event_creator' },
          { name: 'تنفيذ الفعاليات', hasAccess: role === 'admin' || role === 'event_creator' || role === 'event_executor' },
          { name: 'عرض التقارير', hasAccess: role === 'admin' || role === 'event_creator' },
          { name: 'عرض سجل النشاط', hasAccess: role === 'admin' },
          { name: 'إدارة الإشعارات', hasAccess: role === 'admin' },
          { name: 'إدارة المحتوى الإعلامي', hasAccess: role === 'admin' || role === 'event_media' },
          { name: 'إدارة الشهادات', hasAccess: role === 'admin' || role === 'event_creator' },
        ];
        
        return mockPermissions;
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            خطأ في تحميل البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            حدث خطأ أثناء تحميل صلاحيات المستخدم. يرجى المحاولة مرة أخرى.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          صلاحيات المستخدم
        </CardTitle>
        <CardDescription>
          الصلاحيات المتاحة للمستخدم بناءً على دوره: {' '}
          <Badge variant="outline">{role}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissions?.map((permission, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 p-2 rounded-md ${
                permission.hasAccess 
                  ? 'bg-primary/10' 
                  : 'bg-muted/30'
              }`}
            >
              {permission.hasAccess ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={permission.hasAccess ? 'font-medium' : 'text-muted-foreground'}>
                {permission.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
