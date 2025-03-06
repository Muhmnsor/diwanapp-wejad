
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { DashboardAppCard } from "./DashboardAppCard";

interface DashboardApp {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  notifications: number;
}

interface DashboardAppsGridProps {
  apps: DashboardApp[];
}

export const DashboardAppsGrid = ({ apps }: DashboardAppsGridProps) => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ direction: 'rtl' }}>
      {[...apps].reverse().map((app, index) => (
        <DashboardAppCard
          key={app.path}
          title={app.title}
          icon={app.icon}
          path={app.path}
          description={app.description}
          notifications={app.notifications}
          index={index}
          onClick={handleCardClick}
        />
      ))}
    </div>
  );
};
