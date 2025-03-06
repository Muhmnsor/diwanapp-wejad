
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { ProjectStatusBadge } from "./components/ProjectStatusBadge";
import { ProjectDateInfo } from "./components/ProjectDateInfo";
import { ProjectProgress } from "./components/ProjectProgress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { LaunchProjectButton } from "./components/LaunchProjectButton";
import { useEffect, useState } from "react";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  created_at?: string;
  is_draft?: boolean;
  launch_date?: string | null;
}

interface TaskProjectInfoProps {
  project: TaskProject;
  onProjectUpdated?: () => void;
}

export const TaskProjectInfo = ({ project, onProjectUpdated }: TaskProjectInfoProps) => {
  const [isDraft, setIsDraft] = useState(project.is_draft || false);
  
  const { 
    completedTasksCount, 
    totalTasksCount, 
    overdueTasksCount, 
    completionPercentage,
    isLoading,
    refetchData
  } = useProjectTasks(project.id);

  useEffect(() => {
    setIsDraft(project.is_draft || false);
  }, [project.is_draft]);

  const handleProjectLaunched = () => {
    setIsDraft(false);
    refetchData();
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  return (
    <Card className={`border shadow-sm ${isDraft ? 'bg-gray-50/50 border-gray-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {project.title}
            {isDraft && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">مسودة</span>
            )}
          </h1>
          <div className="flex items-center gap-2">
            <Link to={`/tasks/workspace/${project.workspace_id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 h-9"
              >
                <Folder className="h-4 w-4" />
                <span>العودة للمشاريع</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            {isDraft && (
              <LaunchProjectButton 
                projectId={project.id}
                onProjectLaunched={handleProjectLaunched}
              />
            )}
            <ProjectStatusBadge status={project.status} isDraft={isDraft} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`p-4 rounded-md ${isDraft ? 'bg-gray-100' : 'bg-gray-50'}`}>
          <p className="text-gray-700 whitespace-pre-line">
            {project.description || 'لا يوجد وصف لهذا المشروع'}
          </p>
        </div>
        
        <ProjectDateInfo 
          createdAt={project.created_at} 
          dueDate={project.due_date}
          launchDate={project.launch_date}
          isDraft={isDraft}
        />
        
        <ProjectProgress
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
          overdueTasksCount={overdueTasksCount}
          completionPercentage={completionPercentage}
        />

        {isDraft && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800">
            <p className="text-sm">
              <strong>هذا المشروع في وضع المسودة.</strong> قم بإنشاء المهام وتعيينها قبل إطلاق المشروع. لن يتم إخطار المكلفين بالمهام حتى يتم إطلاق المشروع.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
