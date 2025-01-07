import { AppCard } from "./AppCard";
import { Calendar, Users, FileText, Bell, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export const AppGrid = () => {
  const { user } = useAuthStore();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      <AppCard
        title="إدارة الفعاليات"
        description="إدارة وتنظيم الفعاليات والأنشطة"
        icon={Calendar}
        href="/dashboard"
        color="primary"
      />
      <AppCard
        title="المشاريع"
        description="إدارة المشاريع والبرامج"
        icon={FileText}
        href="/projects"
        color="accent"
      />
      {user?.isAdmin && (
        <>
          <AppCard
            title="المستخدمين"
            description="إدارة المستخدمين والصلاحيات"
            icon={Users}
            href="/users"
            color="secondary"
          />
          <AppCard
            title="الإعدادات"
            description="إدارة إعدادات النظام"
            icon={Settings}
            href="/settings"
            color="secondary"
          />
        </>
      )}
    </div>
  );
};