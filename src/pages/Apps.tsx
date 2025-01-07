import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { AppGrid } from "@/components/dashboard/AppGrid";
import { useAuthStore } from "@/store/auth/authStore";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Apps = () => {
  const { user } = useAuthStore();

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['user-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">التطبيقات</h1>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Apps Grid */}
          <div className="lg:col-span-2">
            <AppGrid />
          </div>

          {/* Tasks */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">المهام</h2>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'مكتمل' : 
                         task.status === 'pending' ? 'قيد الانتظار' : 
                         task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">لا توجد مهام حالياً</p>
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">الإشعارات</h2>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">لا توجد إشعارات جديدة</p>
              )}
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Apps;