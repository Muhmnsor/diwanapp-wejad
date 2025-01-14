import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ListTodo,
  Folder,
  GitPullRequest,
  AlertCircle
} from "lucide-react";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المحافظ</CardTitle>
          <Folder className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalPortfolios}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.activePortfolios} نشط | {data.completedPortfolios} مكتمل
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.syncedPortfolios} متزامن مع Asana
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalTasks}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.completedTasks} مكتمل | {data.inProgressTasks} قيد التنفيذ
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.overdueTasks} متأخر
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المهام العاجلة</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.highPriorityTasks.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.highPriorityTasks.count} مهمة عاجلة
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المهام المكتملة حديثاً</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{data.recentlyCompletedTasks.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.recentlyCompletedTasks.count} مهمة مكتملة
          </div>
        </CardContent>
      </Card>
    </div>
  );
};