import { AppCard } from "./AppCard";
import { Calendar, Users, FileText, Bell, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export const AppGrid = () => {
  const { user } = useAuthStore();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      <AppCard
        title="الفعاليات"
        description="إدارة وتنظيم الفعاليات والأنشطة"
        icon={Calendar}
        href="/events"
        color="primary"
      />
      <AppCard
        title="المشاريع"
        description="إدارة المشاريع والبرامج"
        icon={FileText}
        href="/projects"
        color="accent"
      />
      <AppCard
        title="المهام"
        description="متابعة وإدارة المهام"
        icon={Users}
        href="/tasks"
        color="secondary"
      />
      <AppCard
        title="الإشعارات"
        description="عرض وإدارة الإشعارات"
        icon={Bell}
        href="/notifications"
        color="primary"
      />
      {user?.isAdmin && (
        <AppCard
          title="الإعدادات"
          description="إدارة إعدادات النظام"
          icon={Settings}
          href="/settings"
          color="secondary"
        />
      )}
    </div>
  );
};