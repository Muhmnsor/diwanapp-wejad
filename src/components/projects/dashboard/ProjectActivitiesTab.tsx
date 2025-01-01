import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectReportDialog } from "../reports/ProjectReportDialog";
import { ProjectReportsList } from "../reports/ProjectReportsList";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectActivitiesTabProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivitiesTab = ({
  projectId,
  activityId
}: ProjectActivitiesTabProps) => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  // Fetch project details and activities
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

  const { data: activities = [] } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقارير النشاط</h2>
        <Button onClick={() => setIsAddReportOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تقرير
        </Button>
      </div>

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