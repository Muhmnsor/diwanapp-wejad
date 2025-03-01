import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Database, ListChecks, Lightbulb, DollarSign, Globe, ShoppingCart, Users, Bell } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const apps = [
    {
      title: "إدارة الفعاليات",
      icon: ListChecks,
      path: "/",
      description: "إدارة وتنظيم الفعاليات والأنشطة"
    },
    {
      title: "إدارة المستندات",
      icon: Database,
      path: "/documents",
      description: "إدارة وتنظيم المستندات والملفات"
    },
    {
      title: "إدارة المهام",
      icon: ListChecks,
      path: "/tasks",
      description: "إدارة وتتبع المهام والمشاريع"
    },
    {
      title: "إدارة الأفكار",
      icon: Lightbulb,
      path: "/ideas",
      description: "إدارة وتنظيم الأفكار والمقترحات"
    },
    {
      title: "إدارة الأموال",
      icon: DollarSign,
      path: "/finance",
      description: "إدارة الميزانية والمصروفات"
    },
    {
      title: "إدارة المستخدمين",
      icon: Users,
      path: "/users-management",
      description: "إدارة حسابات المستخدمين والصلاحيات"
    },
    {
      title: "الموقع الإلكتروني",
      icon: Globe,
      path: "/website",
      description: "إدارة وتحديث محتوى الموقع الإلكتروني"
    },
    {
      title: "المتجر الإلكتروني",
      icon: ShoppingCart,
      path: "/store",
      description: "إدارة المنتجات والطلبات في المتجر الإلكتروني"
    }
  ];

  const userTasks = [
    { id: 1, title: "مراجعة تقرير الفعالية", dueDate: "اليوم", app: "إدارة الفعاليات" },
    { id: 2, title: "تحديث محتوى الموقع", dueDate: "غداً", app: "الموقع الإلكتروني" },
    { id: 3, title: "الموافقة على الفكرة الجديدة", dueDate: "بعد يومين", app: "إدارة الأفكار" },
  ];

  const notifications = [
    { id: 1, message: "تم تسجيل مستخدم جديد", time: "منذ 5 دقائق", app: "إدارة المستخدمين" },
    { id: 2, message: "طلب جديد في المتجر", time: "منذ ساعة", app: "المتجر الإلكتروني" },
    { id: 3, message: "تم إضافة مستند جديد", time: "منذ 3 ساعات", app: "إدارة المستندات" },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">لوحة التحكم المركزية</h1>
        
        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="apps">التطبيقات</TabsTrigger>
            <TabsTrigger value="personal">لوحة المستخدم الشخصية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apps" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => {
                const Icon = app.icon;
                return (
                  <Card
                    key={app.path}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(app.path)}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Icon className="w-12 h-12 text-primary" />
                      <h2 className="text-xl font-semibold">{app.title}</h2>
                      <p className="text-gray-600">{app.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="personal" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <ListChecks className="w-6 h-6 text-primary ml-2" />
                  <h2 className="text-xl font-semibold">المهام المطلوبة</h2>
                </div>
                <div className="space-y-4">
                  {userTasks.map(task => (
                    <div key={task.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{task.title}</div>
                        <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{task.app}</div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Bell className="w-6 h-6 text-primary ml-2" />
                  <h2 className="text-xl font-semibold">آخر الإشعارات</h2>
                </div>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{notification.message}</div>
                        <span className="text-sm text-muted-foreground">{notification.time}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{notification.app}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
