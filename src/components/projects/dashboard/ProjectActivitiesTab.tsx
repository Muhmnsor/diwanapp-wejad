import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityListHeader } from "@/components/projects/activities/list/ActivityListHeader";
import { useActivityManagement } from "@/components/projects/activities/hooks/useActivityManagement";

interface ProjectActivitiesTabProps {
  projectId: string;
}

export const ProjectActivitiesTab = ({ projectId }: ProjectActivitiesTabProps) => {
  console.log('ProjectActivitiesTab - projectId:', projectId);
  
  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_project_activity", true)
        .order("date", { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      console.log('Fetched activities:', data);
      return data || [];
    },
  });

  const handleRefetch = async () => {
    await refetchActivities();
  };

  const {
    handleEditEvent,
    handleDeleteEvent,
  } = useActivityManagement(projectId, handleRefetch);

  if (!activities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActivityListHeader 
        projectId={projectId}
        onSuccess={handleRefetch}
      />

      <Card className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{activity.title}</h3>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                {activity.date} - {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};