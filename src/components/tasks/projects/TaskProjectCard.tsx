
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  CalendarIcon,
  CheckCircle2,
  Clock,
  ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
}

interface TaskProjectCardProps {
  project: TaskProject;
}

export const TaskProjectCard = ({ project }: TaskProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // في المستقبل سنقوم بتوجيه المستخدم إلى صفحة تفاصيل المشروع
    // navigate(`/tasks/projects/${project.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> مكتمل</Badge>;
      case 'in_progress':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد التنفيذ</Badge>;
      case 'pending':
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
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="mb-3">
          <h3 className="font-bold text-lg">{project.title}</h3>
          {getStatusBadge(project.status)}
        </div>
        
        <p className="text-gray-500 mb-4 text-sm line-clamp-2">
          {project.description || 'لا يوجد وصف'}
        </p>
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
      </CardFooter>
    </Card>
  );
};
