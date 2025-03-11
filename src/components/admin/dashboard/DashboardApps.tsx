
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
  Inbox,
  Loader2
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
  isLoading?: boolean;
}

export const DashboardApps = ({ apps, isLoading = false }: DashboardAppsProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">جاري تحميل التطبيقات...</p>
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex justify-center items-center p-8 bg-muted/20 rounded-lg mt-6 mb-10">
        <div className="text-center">
          <h3 className="font-medium text-lg">لا توجد تطبيقات متاحة</h3>
          <p className="text-muted-foreground mt-2">ليس لديك صلاحية الوصول لأي تطبيقات</p>
        </div>
      </div>
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
