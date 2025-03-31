
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface LeaveStatsProps {
  stats: {
    totalRequests: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    totalDays: number;
    approvedPercentage: number;
    rejectedPercentage: number;
    pendingPercentage: number;
  };
}

export function LeaveStats({ stats }: LeaveStatsProps) {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              <h3 className="text-2xl font-bold">{stats.totalRequests}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalDays} يوم إجازة
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">موافق عليها</p>
              <h3 className="text-2xl font-bold">{stats.approvedCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.approvedPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">قيد الانتظار</p>
              <h3 className="text-2xl font-bold">{stats.pendingCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.pendingPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
