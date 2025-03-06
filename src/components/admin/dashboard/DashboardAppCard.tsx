
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardAppCardProps {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  notifications: number;
  index: number;
  onClick: (path: string) => void;
}

export const DashboardAppCard = ({
  title,
  icon: Icon,
  path,
  description,
  notifications,
  index,
  onClick
}: DashboardAppCardProps) => {
  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center relative animate-fade-in"
      style={{ 
        direction: 'rtl',
        animationDelay: `${index * 50}ms`
      }}
      onClick={() => onClick(path)}
    >
      <div className="flex flex-col items-center text-center space-y-4 w-full">
        <div className="w-full flex justify-center relative">
          <Icon className="w-12 h-12 text-primary" />
          {notifications > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500" variant="destructive">
              {notifications}
            </Badge>
          )}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Card>
  );
};
