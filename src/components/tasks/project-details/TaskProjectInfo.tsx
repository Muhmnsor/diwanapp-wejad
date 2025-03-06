
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { ProjectStatusBadge } from "./components/ProjectStatusBadge";
import { ProjectDateInfo } from "./components/ProjectDateInfo";
import { ProjectProgress } from "./components/ProjectProgress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LaunchProjectDialog } from "../projects/LaunchProjectDialog";

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
}

interface TaskProjectInfoProps {
  project: TaskProject;
  onProjectUpdated?: () => void;
}

export const TaskProjectInfo = ({ project, onProjectUpdated }: TaskProjectInfoProps) => {
  const { 
    completedTasksCount, 
    totalTasksCount, 
    overdueTasksCount, 
    completionPercentage,
    isLoading 
  } = useProjectTasks(project.id);

  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);

  const handleProjectLaunched = () => {
    toast.success("تم إطلاق المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    } else {
      // Refresh the page to show updated project status
      window.location.reload();
    }
  };

  return (
    <Card className={`border shadow-sm ${project.is_draft ? 'border-dashed border-2 border-blue-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            {project.is_draft && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 mt-1">
                مسودة
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {project.is_draft && (
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-9 border-blue-500 text-blue-700 hover:bg-blue-50"
                onClick={() => setIsLaunchDialogOpen(true)}
              >
                <Rocket className="h-4 w-4" />
                <span>إطلاق المشروع</span>
              </Button>
            )}
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
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {project.is_draft && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-blue-700 text-sm">
              هذا المشروع في وضع المسودة. قم بتعديل المهام وتعيين الأشخاص المسؤولين والتواريخ المستهدفة، ثم اضغط على زر "إطلاق المشروع" عندما تكون جاهزًا لبدء العمل.
            </p>
          </div>
        )}
        
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

      <LaunchProjectDialog
        open={isLaunchDialogOpen}
        onOpenChange={setIsLaunchDialogOpen}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={handleProjectLaunched}
      />
    </Card>
  );
};
