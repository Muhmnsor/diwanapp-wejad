
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { ProjectStatusBadge } from "./components/ProjectStatusBadge";
import { ProjectDateInfo } from "./components/ProjectDateInfo";
import { ProjectProgress } from "./components/ProjectProgress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder } from "lucide-react";
import { Link } from "react-router-dom";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  created_at?: string;
}

interface TaskProjectInfoProps {
  project: TaskProject;
}

export const TaskProjectInfo = ({ project }: TaskProjectInfoProps) => {
  const { 
    completedTasksCount, 
    totalTasksCount, 
    overdueTasksCount, 
    completionPercentage,
    isLoading 
  } = useProjectTasks(project.id);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-2">
            <Link to={`/workspace-tasks/${project.workspace_id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <Folder className="h-4 w-4" />
                <span>العودة للمشاريع</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700 whitespace-pre-line">
            {project.description || 'لا يوجد وصف لهذا المشروع'}
          </p>
        </div>
        
        <ProjectDateInfo 
          createdAt={project.created_at} 
          dueDate={project.due_date}
        />
        
        <ProjectProgress
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
          overdueTasksCount={overdueTasksCount}
          completionPercentage={completionPercentage}
        />
      </CardContent>
    </Card>
  );
};
