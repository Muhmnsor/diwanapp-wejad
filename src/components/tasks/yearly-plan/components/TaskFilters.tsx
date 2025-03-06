
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskFiltersProps {
  filters: {
    status: string[];
    assignee: string[];
    workspace: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    status: string[];
    assignee: string[];
    workspace: string[];
  }>>;
  projects: any[]; 
  showAllProjects: boolean;
  setShowAllProjects: (show: boolean) => void;
}

export const TaskFilters = ({ 
  filters, 
  setFilters, 
  projects, 
  showAllProjects, 
  setShowAllProjects 
}: TaskFiltersProps) => {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState<string[]>([]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      const uniqueStatuses = [...new Set(projects.map(project => project.status))];
      const uniqueWorkspaces = [...new Set(projects.map(project => project.workspace_id))];
      
      setStatuses(uniqueStatuses);
      setWorkspaces(uniqueWorkspaces);
    }
  }, [projects]);

  const handleStatusChange = (status: string) => {
    setFilters(prev => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      
      return { ...prev, status: newStatuses };
    });
  };

  const handleWorkspaceChange = (workspace: string) => {
    setFilters(prev => {
      const newWorkspaces = prev.workspace.includes(workspace)
        ? prev.workspace.filter(w => w !== workspace)
        : [...prev.workspace, workspace];
      
      return { ...prev, workspace: newWorkspaces };
    });
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'معلق';
      case 'delayed': return 'متأخر';
      default: return status;
    }
  };

  const getWorkspaceName = (workspaceId: string): string => {
    const project = projects.find(p => p.workspace_id === workspaceId);
    return project?.workspace_name || workspaceId;
  };

  const handleShowAllToggle = () => {
    setShowAllProjects(!showAllProjects);
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-3">تصفية حسب الحالة</h3>
          <div className="space-y-2">
            {statuses.map(status => (
              <div key={status} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id={`status-${status}`}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleStatusChange(status)}
                  disabled={showAllProjects}
                />
                <Label 
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal"
                >
                  {getStatusLabel(status)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">تصفية حسب مساحة العمل</h3>
          <div className="space-y-2">
            {workspaces.map(workspace => (
              <div key={workspace} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id={`workspace-${workspace}`}
                  checked={filters.workspace.includes(workspace)}
                  onCheckedChange={() => handleWorkspaceChange(workspace)}
                  disabled={showAllProjects}
                />
                <Label 
                  htmlFor={`workspace-${workspace}`}
                  className="text-sm font-normal"
                >
                  {getWorkspaceName(workspace)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">عرض المشاريع</h3>
          <Button 
            variant={showAllProjects ? "default" : "outline"} 
            onClick={handleShowAllToggle}
            className="w-full"
          >
            {showAllProjects ? "عرض جميع المشاريع" : "تطبيق التصفية"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
