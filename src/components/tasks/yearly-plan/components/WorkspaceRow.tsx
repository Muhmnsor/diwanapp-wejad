
import { WorkspaceWithProjects } from "../types/yearlyPlanTypes";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectRow } from "./ProjectRow";

interface WorkspaceRowProps {
  workspace: WorkspaceWithProjects;
  months: Date[];
  today: Date;
  onToggleExpand: (id: string) => void;
  onToggleProject: (id: string) => void;
}

export const WorkspaceRow = ({ 
  workspace, 
  months, 
  today, 
  onToggleExpand, 
  onToggleProject 
}: WorkspaceRowProps) => {
  // التأكد من وجود مشاريع
  const hasProjects = workspace.projects && workspace.projects.length > 0;
  
  // إجمالي المشاريع في مساحة العمل
  const totalProjects = hasProjects ? workspace.projects.length : 0;
  const completedProjects = hasProjects 
    ? workspace.projects.filter(p => p.status === 'completed').length
    : 0;
  const delayedProjects = hasProjects
    ? workspace.projects.filter(p => p.status === 'delayed').length
    : 0;
  
  return (
    <div className="space-y-2 mb-6 border-b pb-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleExpand(workspace.id)}
          className="p-1 h-6 w-6"
          disabled={!hasProjects}
        >
          {workspace.expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        <div className="w-48 font-semibold flex items-center">
          {workspace.name}
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {totalProjects}
          </span>
        </div>
        
        <div className="flex-1 flex items-center gap-2">
          <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            مكتمل: {completedProjects}
          </div>
          <div className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
            متأخر: {delayedProjects}
          </div>
        </div>
      </div>
      
      {workspace.expanded && hasProjects && (
        <div className="pl-6 space-y-4">
          {workspace.projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              months={months}
              today={today}
              onToggleExpand={() => onToggleProject(project.id)}
            />
          ))}
        </div>
      )}
      
      {workspace.expanded && !hasProjects && (
        <div className="pl-6 py-4 text-center text-gray-500">
          لا توجد مشاريع في مساحة العمل هذه
        </div>
      )}
    </div>
  );
};
