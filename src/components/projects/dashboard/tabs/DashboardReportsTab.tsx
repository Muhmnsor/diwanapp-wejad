import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { ProjectReportDialog } from "../../reports/ProjectReportDialog";
import { ProjectReportsList } from "../../reports/ProjectReportsList";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectReportForm } from "../../reports/ProjectReportForm";

interface DashboardReportsTabProps {
  projectId: string;
  activityId: string;
}

export const DashboardReportsTab = ({
  projectId,
  activityId
}: DashboardReportsTabProps) => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Fetch project details to get the title
  const { data: project } = useQuery({
    queryKey: ['project-details', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch project activities
  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleFormSuccess = () => {
    setIsFormExpanded(false);
  };

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

      <ProjectReportDialog
        open={isAddReportOpen}
        onOpenChange={setIsAddReportOpen}
        projectId={projectId}
        activityId={activityId}
        projectTitle={project?.title || ''}
        activities={activities}
      />
    </div>
  );
};