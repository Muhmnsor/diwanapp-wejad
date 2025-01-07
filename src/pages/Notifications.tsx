import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Bell } from "lucide-react";

const Notifications = () => {
  const { user } = useAuthStore();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">الإشعارات</h1>
        {isLoading ? (
          <div>جاري التحميل...</div>
        ) : notifications?.length ? (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 mt-1" />
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">لا توجد إشعارات جديدة</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;