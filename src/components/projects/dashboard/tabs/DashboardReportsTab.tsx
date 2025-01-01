import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectReportDialog } from "../../reports/ProjectReportDialog";
import { ProjectReportsList } from "../../reports/ProjectReportsList";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardReportsTabProps {
  projectId: string;
  activityId: string;
}

export const DashboardReportsTab = ({
  projectId,
  activityId
}: DashboardReportsTabProps) => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  // Fetch project activities to ensure we have valid activities
  const { data: activities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities for reports:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      console.log('Fetched activities:', data);
      return data || [];
    },
  });

  // Get the first activity ID if none is selected
  const effectiveActivityId = activityId || (activities && activities[0]?.id);

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
          activityId={effectiveActivityId}
        />
      </Card>

      <ProjectReportDialog
        open={isAddReportOpen}
        onOpenChange={setIsAddReportOpen}
        projectId={projectId}
        activityId={effectiveActivityId}
      />
    </div>
  );
};