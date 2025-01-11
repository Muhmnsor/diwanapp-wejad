import { useState } from "react";
import { Project } from "@/types/project";
import { ProjectTask } from "@/types/task";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, FolderKanban } from "lucide-react";
import { TasksList } from "./TasksList";

interface ProjectCardProps {
  project: Project;
  tasks: ProjectTask[];
}

export const ProjectCard = ({ project, tasks }: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4">
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
        <div className="mt-4 pr-4 border-r border-gray-200">
          <TasksList tasks={tasks} />
        </div>
      )}
    </Card>
  );
};