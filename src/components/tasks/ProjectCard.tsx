import { useState } from "react";
import { TaskProject } from "@/types/task";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, FolderKanban } from "lucide-react";
import { TasksList } from "./TasksList";
import { TaskDialog } from "./dialogs/TaskDialog";

interface TaskProjectCardProps {
  project: TaskProject;
  tasks: ProjectTask[];
}

export const TaskProjectCard = ({ project, tasks }: TaskProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-primary" />
            <h4 className="font-medium">مشروع المهام: {project.title}</h4>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <TaskDialog projectId={project.id} onSuccess={() => window.location.reload()} />
            </div>
            <div className="pr-4 border-r border-gray-200">
              <TasksList tasks={tasks} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};