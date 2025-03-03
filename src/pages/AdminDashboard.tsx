
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  Database, 
  ListChecks, 
  Lightbulb, 
  DollarSign, 
  Globe, 
  ShoppingCart, 
  Users, 
  Bell,
  BellRing,
  Clock
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { PendingTasksList } from "@/components/tasks/PendingTasksList";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userName = user?.user_metadata?.name || "المستخدم";

  // Fetch notification counts
  const { data: notificationCounts } = useQuery({
    queryKey: ['notification-counts'],
    queryFn: async () => {
      // Fetch pending tasks count
      const { data: pendingTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      // Fetch unread notifications count
      const { data: unreadNotifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .eq('user_id', user?.id);

      // Fetch new ideas count
      const { data: newIdeas, error: ideasError } = await supabase
        .from('ideas')
        .select('id', { count: 'exact' })
        .eq('status', 'new');

      // Fetch pending finance approvals
      const { data: pendingFinance, error: financeError } = await supabase
        .from('financial_resources')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (tasksError || notificationsError || ideasError || financeError) {
        console.error("Error fetching notification counts:", tasksError || notificationsError || ideasError || financeError);
      }

      return {
        tasks: pendingTasks?.length || 0,
        notifications: unreadNotifications?.length || 0,
        ideas: newIdeas?.length || 0,
        finance: pendingFinance?.length || 0,
      };
    },
    initialData: {
      tasks: 0,
      notifications: 0,
      ideas: 0,
      finance: 0
    }
  });

  const apps = [
    {
      title: "إدارة الفعاليات",
      icon: ListChecks,
      path: "/",
      description: "إدارة وتنظيم الفعاليات والأنشطة",
      notifications: 0
    },
    {
      title: "إدارة المستندات",
      icon: Database,
      path: "/documents",
      description: "إدارة وتنظيم المستندات والملفات",
      notifications: 0
    },
    {
      title: "إدارة المهام",
      icon: Clock,
      path: "/tasks",
      description: "إدارة وتتبع المهام والمشاريع",
      notifications: notificationCounts.tasks
    },
    {
      title: "إدارة الأفكار",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة وتنظيم الأفكار والمقترحات",
      notifications: notificationCounts.ideas
    },
    {
      title: "إدارة الأموال",
      icon: DollarSign,
      path: "/finance",
      description: "إدارة الميزانية والمصروفات",
      notifications: notificationCounts.finance
    },
    {
      title: "إدارة المستخدمين",
      icon: Users,
      path: "/users-management",
      description: "إدارة حسابات المستخدمين والصلاحيات",
      notifications: 0
    },
    {
      title: "الموقع الإلكتروني",
      icon: Globe,
      path: "/website",
      description: "إدارة وتحديث محتوى الموقع الإلكتروني",
      notifications: 0
    },
    {
      title: "المتجر الإلكتروني",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المنتجات والطلبات في المتجر الإلكتروني",
      notifications: 0
    },
    {
      title: "الإشعارات",
      icon: Bell,
      path: "/notifications",
      description: "عرض وإدارة إشعارات النظام",
      notifications: notificationCounts.notifications
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">مرحباً بك، {userName}</h1>
          <p className="text-gray-600 mt-2">نتمنى لك يوماً مليئاً بالإنجازات في لوحة التحكم المركزية</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ direction: 'rtl' }}>
          {[...apps].reverse().map((app, index) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.path}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center relative animate-fade-in"
                style={{ 
                  direction: 'rtl',
                  animationDelay: `${index * 50}ms`
                }}
                onClick={() => navigate(app.path)}
              >
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                  <div className="w-full flex justify-center relative">
                    <Icon className="w-12 h-12 text-primary" />
                    {app.notifications > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500" variant="destructive">
                        {app.notifications}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{app.title}</h2>
                  <p className="text-gray-600">{app.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex flex-row-reverse items-center mb-4">
                  <Clock className="w-6 h-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">المهام المطلوبة</h2>
                </div>
                <PendingTasksList />
              </Card>
              
              <Card className="p-6">
                <div className="flex flex-row-reverse items-center mb-4">
                  <BellRing className="w-6 h-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold">آخر الإشعارات</h2>
                </div>
                <div className="space-y-4">
                  {notificationCounts.notifications > 0 ? (
                    <div className="space-y-3">
                      {Array.from({ length: Math.min(3, notificationCounts.notifications) }).map((_, i) => (
                        <div key={i} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-muted-foreground">منذ قليل</span>
                            <div className="font-medium">إشعار جديد</div>
                          </div>
                          <div className="text-sm text-muted-foreground text-left">يمكنك الاطلاع على تفاصيل الإشعار بالضغط هنا</div>
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
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
