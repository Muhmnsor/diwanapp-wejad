
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WorkspaceProgressProps {
  workspaceId: string;
}

export const WorkspaceProgress = ({ workspaceId }: WorkspaceProgressProps) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    percentCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!workspaceId) return;
      
      setIsLoading(true);
      try {
        // Get all tasks for this workspace
        const { data, error } = await supabase
          .from('tasks')
          .select('status')
          .eq('workspace_id', workspaceId);
          
        if (error) throw error;
        
        // Calculate stats
        const total = data.length;
        const completed = data.filter(task => task.status === 'completed').length;
        const inProgress = data.filter(task => task.status === 'in_progress').length;
        const pending = data.filter(task => task.status === 'pending').length;
        const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setStats({
          total,
          completed,
          pending,
          inProgress,
          percentCompleted
        });
      } catch (error) {
        console.error("Error fetching workspace stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [workspaceId]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-gray-500">جاري تحميل إحصائيات المهام...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقدم العمل</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">اكتمال المهام</span>
              <span className="text-sm text-gray-500">{stats.percentCompleted}%</span>
            </div>
            <Progress value={stats.percentCompleted} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-4">
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">مكتملة</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-md">
              <p className="text-xl font-bold text-amber-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">قيد التنفيذ</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">قيد الانتظار</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
