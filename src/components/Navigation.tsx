import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminNavLinks } from "./navigation/AdminNavLinks";
import { LayoutDashboard, FolderKanban } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const Navigation = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();

  console.log('Navigation - User:', user);
  console.log('Navigation - Current location:', location.pathname);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    {
      title: "المحافظ",
      url: "/tasks",
      icon: FolderKanban,
    },
    {
      title: "لوحة المعلومات",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="flex gap-2 md:gap-4 items-center flex-wrap" dir="rtl">
      {user?.isAdmin && <AdminNavLinks isActive={isActive} isMobile={isMobile} />}
      
      <Sidebar variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>إدارة المهام</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
};