
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Shield, Database, LayoutDashboard, Settings, Code } from "lucide-react";

export const SystemPages = () => {
  const navigate = useNavigate();

  const pages = [
    {
      title: "إدارة المستخدمين",
      description: "إضافة وتعديل وحذف المستخدمين وإدارة الأدوار والصلاحيات",
      icon: <Users className="h-10 w-10 text-primary" />,
      path: "/admin/users-management"
    },
    {
      title: "إعدادات النظام",
      description: "تخصيص إعدادات النظام وتكوينه حسب احتياجات المؤسسة",
      icon: <Settings className="h-10 w-10 text-primary" />,
      path: "/settings"
    },
    {
      title: "إدارة التطبيقات",
      description: "التحكم في ظهور التطبيقات في لوحة التحكم المركزية",
      icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
      path: "/admin/app-permissions"
    },
    {
      title: "إدارة قاعدة البيانات",
      description: "استعراض وإدارة بنية قاعدة البيانات والنماذج",
      icon: <Database className="h-10 w-10 text-primary" />,
      path: "/admin/database-management"
    },
    {
      title: "إدارة الصلاحيات",
      description: "تكوين وتعديل صلاحيات النظام والوصول للموارد",
      icon: <Shield className="h-10 w-10 text-primary" />,
      path: "/admin/permissions"
    },
    {
      title: "أدوات المطور",
      description: "أدوات خاصة للمطورين وإعدادات تطوير النظام",
      icon: <Code className="h-10 w-10 text-primary" />,
      path: "/admin/developer-settings"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <div className="mb-4">{page.icon}</div>
            <CardTitle className="text-xl">{page.title}</CardTitle>
            <CardDescription>{page.description}</CardDescription>
          </CardHeader>
          <CardFooter className="pt-3 pb-6 px-6">
            <Button 
              variant="default" 
              onClick={() => navigate(page.path)}
              className="w-full"
            >
              الذهاب للصفحة
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
