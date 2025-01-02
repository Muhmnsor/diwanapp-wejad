import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectReportForm } from "../../reports/ProjectReportForm";
import { ProjectReportsList } from "../../reports/ProjectReportsList";

interface DashboardReportsTabProps {
  projectId: string;
  activityId: string;
}

export const DashboardReportsTab = ({
  projectId,
  activityId
}: DashboardReportsTabProps) => {
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Fetch project details to get the title
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      console.log('Fetching project details:', projectId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch project activities
  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const handleFormSuccess = () => {
    setIsFormExpanded(false);
  };

  if (isProjectLoading || isActivitiesLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">جاري التحميل...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button 
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          variant="outline"
          className="gap-2"
        >
          {isFormExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          إضافة تقرير
        </Button>
      </div>

      {isFormExpanded && project && (
        <Card className="p-6">
          <ProjectReportForm
            projectId={projectId}
            activityId={activityId}
            projectTitle={project.title}
            activities={activities}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormExpanded(false)}
          />
        </Card>
      )}

      <Card>
        <ProjectReportsList
          projectId={projectId}
          activityId={activityId}
        />
      </Card>
    </div>
  );
};