
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckSquare } from "lucide-react";
import { Project } from "@/types/workspace";

interface WorkspaceProjectsProps {
  workspaceId: string | undefined;
}

export const WorkspaceProjects = ({ workspaceId }: WorkspaceProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const fetchProjects = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjects();
  }, [workspaceId]);
  
  const handleCreateProject = () => {
    navigate(`/tasks/create-task-project/${workspaceId}`);
  };
  
  const handleViewProject = (projectId: string) => {
    navigate(`/tasks/project/${projectId}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };
  
  if (!workspaceId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          لم يتم تحديد مساحة العمل
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">المشاريع</h2>
        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إنشاء مشروع
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">مشاريع مساحة العمل</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="border rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewProject(project.id)}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className="font-medium text-lg">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                    </div>
                    <div className={`${getStatusColor(project.status)} text-sm flex items-center`}>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      {getStatusText(project.status)}
                    </div>
                  </div>
                  
                  {(project.start_date || project.end_date) && (
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      {project.start_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>يبدأ: {new Date(project.start_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>ينتهي: {new Date(project.end_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد مشاريع في مساحة العمل هذه
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
