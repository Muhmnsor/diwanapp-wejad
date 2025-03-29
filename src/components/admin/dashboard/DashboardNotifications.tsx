
import { Card } from "@/components/ui/card";
import { BellRing, Clock } from "lucide-react";
import { PendingTasksList } from "@/components/tasks/PendingTasksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DashboardNotificationsProps {
  notificationCount: number;
}

export const DashboardNotifications = ({ notificationCount }: DashboardNotificationsProps) => {
  const { user } = useAuthStore();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['dashboard-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      return 'تاريخ غير معروف';
    }
  };

  return (
    <div className="mt-10">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex flex-row-reverse items-center mb-4">
              <Clock className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">المهام المطلوبة</h2>
            </div>
            <PendingTasksList limit={3} />
          </Card>
          
          <Card className="p-6">
            <div className="flex flex-row-reverse items-center mb-4">
              <BellRing className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">آخر الإشعارات</h2>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">
                          {formatNotificationDate(notification.created_at)}
                        </span>
                        <div className="font-medium">{notification.title}</div>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        {notification.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">لا توجد إشعارات جديدة</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
