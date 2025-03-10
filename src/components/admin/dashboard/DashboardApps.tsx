
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/refactored-auth";

export interface AppItem {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  notifications: number;
  permissionRequired?: string;
}

interface DashboardAppsProps {
  apps: AppItem[];
}

export const DashboardApps: React.FC<DashboardAppsProps> = ({ apps }) => {
  const { user } = useAuthStore();

  return (
    <div className="mb-8" dir="rtl">
      <h2 className="mb-4 text-2xl font-bold">التطبيقات المتاحة</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {apps.map((app, index) => (
          <Link to={app.path} key={index}>
            <Card className="h-full hover:bg-muted/30 transition-colors cursor-pointer border">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <app.icon className="h-5 w-5" />
                  </div>
                  {app.notifications > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {app.notifications}
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg mt-2">{app.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-grow">
                  {app.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">لا توجد تطبيقات متاحة حاليًا</p>
        </div>
      )}
    </div>
  );
};
