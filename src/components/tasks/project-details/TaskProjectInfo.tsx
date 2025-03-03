
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { ProjectStatusBadge } from "./components/ProjectStatusBadge";
import { ProjectDateInfo } from "./components/ProjectDateInfo";
import { ProjectProgress } from "./components/ProjectProgress";

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
          <ProjectStatusBadge status={project.status} />
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
