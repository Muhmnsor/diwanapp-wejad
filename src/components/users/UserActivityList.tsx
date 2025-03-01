
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card,
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserActivity } from "./types";

interface UserActivityListProps {
  userId: string;
}

export const UserActivityList = ({ userId }: UserActivityListProps) => {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['user-activities', userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        return data as UserActivity[];
      } catch (error) {
        console.error('Error fetching user activities:', error);
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            سجل النشاط
          </CardTitle>
          <CardDescription>
            لا يوجد نشاط مسجل لهذا المستخدم
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format activity type for display
  const getActivityTypeDisplay = (type: string) => {
    switch (type) {
      case 'login': return 'تسجيل دخول';
      case 'logout': return 'تسجيل خروج';
      case 'password_change': return 'تغيير كلمة المرور';
      case 'role_change': return 'تغيير الدور';
      case 'create_event': return 'إنشاء فعالية';
      case 'edit_event': return 'تعديل فعالية';
      case 'delete_event': return 'حذف فعالية';
      default: return type;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('ar-SA', options);
  };

  // Get badge variant based on activity type
  const getBadgeVariant = (type: string) => {
    if (type.includes('login') || type.includes('logout')) return 'secondary';
    if (type.includes('delete')) return 'destructive';
    if (type.includes('create')) return 'default';
    if (type.includes('edit') || type.includes('change')) return 'outline';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          سجل النشاط
        </CardTitle>
        <CardDescription>
          آخر {activities.length} نشاط للمستخدم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4 -mr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 border-b pb-3"
              >
                <Badge variant={getBadgeVariant(activity.activity_type)}>
                  {getActivityTypeDisplay(activity.activity_type)}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{activity.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
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
