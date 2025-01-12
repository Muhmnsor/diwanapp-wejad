import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
}

const Tasks = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: tasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Fetching tasks...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('حدث خطأ أثناء جلب المهام');
        throw error;
      }

      console.log('Tasks fetched:', data);
      return data as Task[];
    }
  });

  const syncWithAsana = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Asana sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-asana-tasks', {
        body: { action: 'sync' }
      });

      if (error) throw error;

      await refetchTasks();
      toast.success('تم مزامنة المهام بنجاح');
      console.log('Asana sync completed:', data);
    } catch (error) {
      console.error('Error syncing with Asana:', error);
      toast.error('حدث خطأ أثناء المزامنة مع Asana');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">المهام</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={syncWithAsana}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'مزامنة مع Asana'
              )}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              مهمة جديدة
            </Button>
          </div>
        </div>

        {isLoadingTasks ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !tasks?.length ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <ListChecks className="w-16 h-16 text-primary" />
            <p className="text-lg text-muted-foreground text-center">لا توجد مهام حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="p-4 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {task.status}
                    </span>
                    {task.due_date && (
                      <span className="text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;