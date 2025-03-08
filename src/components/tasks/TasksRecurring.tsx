
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { RecurringTaskCard } from "./recurring-tasks/RecurringTaskCard";
import { RecurringTaskDialog } from "./recurring-tasks/RecurringTaskDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, RefreshCw, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  is_active: boolean;
  day_of_month: number | null;
  project_id: string | null;
  workspace_id: string | null;
  priority: string;
  category: string | null;
  created_by: string;
  created_at: string;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
}

export const TasksRecurring = () => {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      toast.error('حدث خطأ أثناء تحميل المهام المتكررة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringTasks();
  }, []);

  const handleGenerateTasks = async () => {
    if (!isAdmin) {
      toast.error('فقط المدراء يمكنهم توليد المهام المتكررة');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-recurring-tasks',
        { method: 'POST' }
      );

      if (error) throw error;

      if (data && data.success) {
        toast.success(`تم توليد ${data.tasksCreated} مهمة متكررة بنجاح`);
        fetchRecurringTasks();
      } else {
        toast.info('لم يتم توليد أي مهام جديدة');
      }
    } catch (error) {
      console.error('Error generating recurring tasks:', error);
      toast.error('حدث خطأ أثناء توليد المهام المتكررة');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditTask = (task: RecurringTask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleTaskSaved = () => {
    fetchRecurringTasks();
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return activeTab === "active" ? task.is_active : !task.is_active;
  });

  const getTabCount = (status: string) => {
    if (status === "all") return tasks.length;
    return tasks.filter(task => (status === "active" ? task.is_active : !task.is_active)).length;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المهام المتكررة</h2>
        <div className="flex gap-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={handleGenerateTasks} 
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              توليد المهام المتكررة
            </Button>
          )}
          <Button onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء مهمة متكررة
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>إدارة المهام المتكررة</AlertTitle>
        <AlertDescription>
          يمكنك إنشاء قوالب للمهام المتكررة التي تتم بشكل دوري. سيقوم النظام بإنشاء المهام تلقائياً وفقاً للتكرار المحدد.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            جميع المهام ({getTabCount("all")})
          </TabsTrigger>
          <TabsTrigger value="active">
            نشطة ({getTabCount("active")})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            غير نشطة ({getTabCount("inactive")})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <RecurringTaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => handleEditTask(task)}
              onRefresh={fetchRecurringTasks}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border">
            <p className="text-gray-500">لا توجد مهام متكررة {activeTab !== "all" && activeTab === "active" ? "نشطة" : "غير نشطة"}</p>
            <Button 
              variant="link" 
              onClick={() => {
                setEditingTask(null);
                setIsDialogOpen(true);
              }}
            >
              إنشاء مهمة متكررة جديدة
            </Button>
          </div>
        )}
      </div>

      <RecurringTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
      />
    </div>
  );
};
