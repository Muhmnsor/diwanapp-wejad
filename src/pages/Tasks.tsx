import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

const Tasks = () => {
  const { user } = useAuthStore();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['user-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">المهام</h1>
        {isLoading ? (
          <div>جاري التحميل...</div>
        ) : tasks?.length ? (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="p-4">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-2 text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'completed' ? 'مكتمل' : 
                     task.status === 'pending' ? 'قيد الانتظار' : 
                     task.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">لا توجد مهام حالياً</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tasks;