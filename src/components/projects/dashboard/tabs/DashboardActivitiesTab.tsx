import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivitiesList } from "@/components/projects/activities/ActivitiesList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditActivityDialog } from "@/components/projects/activities/dialogs/EditActivityDialog";
import { DeleteActivityDialog } from "@/components/projects/activities/dialogs/DeleteActivityDialog";
import { Card } from "@/components/ui/card";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
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

  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity);
    setIsAddActivityOpen(true);
  };

  const handleDeleteActivity = (activity: any) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">أنشطة المشروع</h2>
        <Button onClick={() => setIsAddActivityOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة نشاط
        </Button>
      </div>

      <Card className="p-6">
        <ActivitiesList
          activities={activities}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
        />
      </Card>

      <EditActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        activity={selectedActivity}
        projectId={projectId}
        onSuccess={() => {
          refetchActivities();
          setSelectedActivity(null);
        }}
      />

      <DeleteActivityDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        activity={selectedActivity}
        onSuccess={() => {
          refetchActivities();
          setSelectedActivity(null);
        }}
      />
    </div>
  );
};