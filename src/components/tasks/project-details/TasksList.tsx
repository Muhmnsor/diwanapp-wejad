
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, CheckCircle2, Clock, ClipboardList, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  priority: string | null;
  created_at: string;
}

interface TasksListProps {
  projectId: string | undefined;
}

export const TasksList = ({ projectId }: TasksListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> مكتمل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد التنفيذ</Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
      case 'delayed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> متعثر</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-500">عالية</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">متوسطة</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500">منخفضة</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };
  
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">المهام</h2>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> إضافة مهمة
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
            <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
            <TabsTrigger value="delayed">متأخرة</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md border">
                <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div key={task.id} className="border rounded-md p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                      
                      {task.assigned_to && (
                        <div>
                          المكلف: {task.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
