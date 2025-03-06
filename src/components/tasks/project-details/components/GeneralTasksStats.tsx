
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GeneralTasksStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    delayed: number;
    upcoming: number;
  };
}

export const GeneralTasksStats = ({ stats }: GeneralTasksStatsProps) => {
  const { total, completed, pending, delayed, upcoming } = stats;
  
  const completionPercentage = total > 0 ? Math.floor((completed / total) * 100) : 0;
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">العدد الكلي</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">مكتملة</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-600">قيد التنفيذ</p>
            <p className="text-2xl font-bold text-blue-600">{pending}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">متأخرة</p>
            <p className="text-2xl font-bold text-red-600">{delayed}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-600">قادمة</p>
            <p className="text-2xl font-bold text-amber-600">{upcoming}</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">نسبة الإنجاز</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
