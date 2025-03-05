import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  CalendarIcon,
  CheckCircle2,
  Clock,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  Edit,
  Trash2,
  ListTodo
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EditTaskProjectDialog } from "./EditTaskProjectDialog";
import { DeleteTaskProjectDialog } from "./DeleteTaskProjectDialog";
import { toast } from "sonner";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
}

interface TaskProjectCardProps {
  project: TaskProject;
  onProjectUpdated?: () => void;
}

export const TaskProjectCard = ({ project, onProjectUpdated }: TaskProjectCardProps) => {
  const navigate = useNavigate();
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [projectOwner, setProjectOwner] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        setCompletionPercentage(percentage);
        
        if (percentage === 100 && project.status !== 'completed' && total > 0) {
          console.log(`Project ${project.id} is 100% complete, updating status to completed`);
          
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({ status: 'completed' })
            .eq('id', project.id);
            
          if (updateError) {
            console.error("Error updating project status:", updateError);
          }
        }

        await fetchProjectOwner();
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [project.id, project.status]);

  const fetchProjectOwner = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching tasks for project owner:", error);
        return;
      }

      if (tasks && tasks.length > 0 && tasks[0].assigned_to) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', tasks[0].assigned_to)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        setProjectOwner(profile?.display_name || profile?.email || "مدير المشروع");
      } else {
        setProjectOwner("غير محدد");
      }
    } catch (err) {
      console.error("Error in fetchProjectOwner:", err);
      setProjectOwner("غير محدد");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-actions')) {
      e.stopPropagation();
      return;
    }
    navigate(`/tasks/project/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    toast.success("تم تحديث المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleProjectDeleted = () => {
    toast.success("تم حذف المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

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
      case 'stopped':
        return <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500"><Clock className="h-3 w-3" /> متوقف</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    }
  };

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch (error) {
      return 'تاريخ غير صالح';
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="absolute top-2 left-2 flex gap-1 z-10 project-actions">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4 text-gray-500" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg">{project.title}</h3>
          {getStatusBadge(project.status)}
        </div>
        
        <p className="text-gray-500 mb-4 text-sm line-clamp-2">
          {project.description || 'لا يوجد وصف'}
        </p>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">نسبة الإنجاز</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <CheckSquare className="h-4 w-4 text-green-500" />
              <span>{completedTasksCount} مهام منجزة</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{overdueTasksCount} مهام متأخرة</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ListTodo className="h-4 w-4 text-blue-500" />
              <span>{totalTasksCount} إجمالي المهام</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t flex justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {project.due_date 
              ? getFormattedDate(project.due_date) 
              : 'غير محدد'}
          </span>
        </div>
        <div className="text-sm font-medium">
          {projectOwner || 'غير محدد'}
        </div>
      </CardFooter>

      <EditTaskProjectDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        project={project}
        onSuccess={handleProjectUpdated}
      />

      <DeleteTaskProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={handleProjectDeleted}
      />
    </Card>
  );
};
