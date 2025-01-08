import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Database, ListChecks, Lightbulb, DollarSign } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const apps = [
    {
      title: "إدارة الفعاليات",
      icon: ListChecks,
      path: "/dashboard",
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">لوحة التحكم المركزية</h1>
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
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;