
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
  Clock,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface AppItem {
  title: string;
  icon: React.ElementType;
  path: string;
  description: string;
  notifications: number;
}

interface DashboardAppsProps {
  apps: AppItem[];
}

export const DashboardApps = ({ apps }: DashboardAppsProps) => {
  const navigate = useNavigate();

  if (!apps || apps.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg text-gray-500">لا توجد تطبيقات متاحة حاليًا</p>
      </Card>
    );
  }

  return (
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
  );
};
