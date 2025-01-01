import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ActivitiesList } from "@/components/projects/activities/ActivitiesList";
import { EditActivityDialog } from "@/components/projects/activities/dialogs/EditActivityDialog";
import { DeleteActivityDialog } from "@/components/projects/activities/dialogs/DeleteActivityDialog";
import { toast } from "sonner";

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

  const handleDeleteConfirm = async () => {
    if (!selectedActivity) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedActivity.id);

      if (error) throw error;

      toast.success('تم حذف النشاط بنجاح');
      await refetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('حدث خطأ أثناء حذف النشاط');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedActivity(null);
    }
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
        activity={selectedActivity}
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onSave={async () => {
          await refetchActivities();
          setSelectedActivity(null);
        }}
        projectId={projectId}
      />

      <DeleteActivityDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};