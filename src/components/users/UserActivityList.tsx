
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, AlertCircle } from "lucide-react";

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  details: string;
  created_at: string;
}

interface UserActivityListProps {
  userId: string;
}

export const UserActivityList = ({ userId }: UserActivityListProps) => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['user-activities', userId],
    queryFn: async () => {
      try {
        // Will be implemented via the user_activities table
        // Currently mocking the data for UI development
        const mockActivities: UserActivity[] = [
          {
            id: '1',
            user_id: userId,
            activity_type: 'login',
            details: 'تسجيل دخول للنظام',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '2',
            user_id: userId,
            activity_type: 'view_event',
            details: 'الاطلاع على فعالية "ورشة عمل التطوير المهني"',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: '3',
            user_id: userId,
            activity_type: 'update_profile',
            details: 'تحديث بيانات الملف الشخصي',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          }
        ];
        
        return mockActivities;
      } catch (error) {
        console.error('Error fetching user activities:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
            حدث خطأ أثناء تحميل سجل نشاط المستخدم. يرجى المحاولة مرة أخرى.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سجل النشاط</CardTitle>
          <CardDescription>لم يتم تسجيل أي نشاط للمستخدم بعد</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل النشاط</CardTitle>
        <CardDescription>آخر الأنشطة التي قام بها المستخدم</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 border-b pb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
