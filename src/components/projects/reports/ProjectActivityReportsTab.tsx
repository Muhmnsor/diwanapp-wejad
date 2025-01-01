import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportForm } from "./components/ReportForm";
import { ReportsList } from "./components/ReportsList";

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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <select
          className="w-full p-2 border rounded-md"
          value={selectedActivityId || ""}
          onChange={(e) => setSelectedActivityId(e.target.value || null)}
        >
          <option value="">اختر النشاط</option>
          {activities?.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>

        {selectedActivityId && (
          <>
            <ReportForm
              projectId={projectId}
              activityId={selectedActivityId}
              onSuccess={() => {
                console.log("Report submitted successfully");
              }}
            />
            <ReportsList
              projectId={projectId}
              activityId={selectedActivityId}
            />
          </>
        )}
      </div>
    </div>
  );
};