import { format } from "date-fns";
import { Calendar, CheckCircle2, Circle, Clock, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAsanaApi } from "@/hooks/useAsanaApi";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    asana_gid: string | null;
  };
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const { syncTask } = useAsanaApi();

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case "completed":
        return "مكتمل";
      case "in_progress":
        return "قيد التنفيذ";
      default:
        return "معلق";
    }
  };

  const handleSync = async () => {
    if (task.asana_gid) {
      await syncTask(task.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <CardTitle className="text-lg">{task.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {task.asana_gid && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <RefreshCw className="h-3 w-3 mr-1" />
              Asana
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`${
              task.status === "completed"
                ? "bg-green-100 text-green-800"
                : task.status === "in_progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent>
          <p className="text-sm text-gray-600">{task.description}</p>
          {task.due_date && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.due_date), "dd/MM/yyyy")}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};