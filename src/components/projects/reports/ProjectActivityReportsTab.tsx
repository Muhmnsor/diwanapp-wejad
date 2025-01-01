import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ActivitySelector } from "@/components/admin/dashboard/preparation/ActivitySelector";
import { ProjectActivityReportForm } from "./ProjectActivityReportForm";
import { ProjectActivityReportsList } from "./ProjectActivityReportsList";

interface ProjectActivityReportsTabProps {
  projectId: string;
  activityId: string | null;
}

export const ProjectActivityReportsTab = ({ 
  projectId, 
  activityId: initialActivityId 
}: ProjectActivityReportsTabProps) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialActivityId);

  const { data: activities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log("Fetching activities for project:", projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) throw error;
      console.log("Fetched activities:", data);
      return data || [];
    },
  });

  const handleActivityChange = (value: string) => {
    console.log("Selected activity:", value);
    setSelectedActivityId(value);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <ActivitySelector
            activities={activities || []}
            selectedActivity={selectedActivityId}
            onActivityChange={handleActivityChange}
          />

          {selectedActivityId && (
            <>
              <ProjectActivityReportForm
                projectId={projectId}
                activityId={selectedActivityId}
                onSuccess={() => {
                  console.log("Report submitted successfully");
                }}
              />
              <ProjectActivityReportsList
                projectId={projectId}
                activityId={selectedActivityId}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};