
import { TasksSection } from "./TasksSection";
import { NotificationsSection } from "./NotificationsSection";
import { WelcomeSection } from "./WelcomeSection";
import { DashboardTabs } from "./DashboardTabs";
import { LucideIcon } from "lucide-react";

interface DashboardApp {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  notifications: number;
}

interface DashboardContentProps {
  userName: string;
  isLoadingUser: boolean;
  apps: DashboardApp[];
  notificationsCount: number;
}

export const DashboardContent = ({ 
  userName, 
  isLoadingUser, 
  apps, 
  notificationsCount 
}: DashboardContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      <WelcomeSection userName={userName} isLoading={isLoadingUser} />
      
      <DashboardTabs apps={apps} />

      <div className="mt-10">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TasksSection />
            <NotificationsSection notificationsCount={notificationsCount} />
          </div>
        </div>
      </div>
    </div>
  );
};
