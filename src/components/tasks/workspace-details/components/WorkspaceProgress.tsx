
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceProgressProps {
  workspaceId: string;
}

export const WorkspaceProgress = ({ workspaceId }: WorkspaceProgressProps) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    delayed: 0,
    completionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get all tasks for the workspace
        const { data, error } = await supabase
          .from('tasks')
          .select('status, due_date')
          .eq('workspace_id', workspaceId);
          
        if (error) throw error;
        
        const now = new Date();
        
        // Calculate task statistics
        const totalTasks = data?.length || 0;
        const completedTasks = data?.filter(task => task.status === 'completed').length || 0;
        const inProgressTasks = data?.filter(task => task.status === 'in_progress').length || 0;
        const pendingTasks = data?.filter(task => task.status === 'pending').length || 0;
        
        // Calculate delayed tasks (tasks with due_date in the past and not completed)
        const delayedTasks = data?.filter(task => {
          if (task.status === 'completed') return false;
          if (!task.due_date) return false;
          
          const dueDate = new Date(task.due_date);
          return dueDate < now;
        }).length || 0;
        
        // Calculate completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        setStats({
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          pending: pendingTasks,
          delayed: delayedTasks,
          completionRate: completionRate
        });
      } catch (error) {
        console.error('Error fetching workspace stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [workspaceId]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقدم المهام</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                نسبة الإكمال ({stats.completionRate.toFixed(0)}%)
              </span>
              <span className="text-sm text-gray-500">
                {stats.completed} / {stats.total} مهمة مكتملة
              </span>
            </div>
            <Progress
              value={stats.completionRate}
              className="h-2"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="border rounded-md p-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">إجمالي المهام</div>
            </div>
            
            <div className="border rounded-md p-3 text-center bg-green-50">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">مكتملة</div>
            </div>
            
            <div className="border rounded-md p-3 text-center bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-500">قيد التنفيذ</div>
            </div>
            
            <div className="border rounded-md p-3 text-center bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">قيد الانتظار</div>
            </div>
          </div>
          
          {stats.delayed > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-red-600">المهام المتأخرة</div>
                <div className="text-xl font-bold text-red-600">{stats.delayed}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
