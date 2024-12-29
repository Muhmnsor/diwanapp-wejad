import { Card, CardContent } from "@/components/ui/card";
import { ProjectDashboardHeader } from "./ProjectDashboardHeader";
import { ProjectEventsList } from "./ProjectEventsList";
import { AddProjectEventDialog } from "@/components/projects/events/AddProjectEventDialog";
import { EditProjectEventDialog } from "@/components/projects/events/EditProjectEventDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectActivitiesTabProps {
  project: {
    id: string;
  };
  projectActivities: any[];
  refetchActivities: () => void;
}

export const ProjectActivitiesTab = ({ 
  project,
  projectActivities,
  refetchActivities
}: ProjectActivitiesTabProps) => {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleAddEvent = () => {
    setIsAddEventOpen(true);
  };

  const handleEditEvent = (projectEvent: any) => {
    console.log("Editing project event:", projectEvent);
    setSelectedEvent(projectEvent);
    setIsEditEventOpen(true);
  };

  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const { error: projectEventError } = await supabase
        .from('project_events')
        .delete()
        .eq('event_id', selectedEvent.event.id)
        .eq('project_id', project.id);

      if (projectEventError) throw projectEventError;

      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.event.id);

      if (eventError) throw eventError;

      toast.success('تم حذف الفعالية بنجاح');
      refetchActivities();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('حدث خطأ أثناء حذف الفعالية');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleEventUpdate = async (updatedEvent: any) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updatedEvent)
        .eq('id', selectedEvent.event.id);

      if (error) throw error;

      toast.success('تم تحديث الفعالية بنجاح');
      refetchActivities();
      setIsEditEventOpen(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('حدث خطأ أثناء تحديث الفعالية');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ProjectDashboardHeader onAddEvent={handleAddEvent} />
        <ProjectEventsList
          projectEvents={projectActivities}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />

        <AddProjectEventDialog
          open={isAddEventOpen}
          onOpenChange={setIsAddEventOpen}
          projectId={project.id}
          onSuccess={refetchActivities}
        />

        {selectedEvent && (
          <EditProjectEventDialog
            event={selectedEvent.event}
            open={isEditEventOpen}
            onOpenChange={setIsEditEventOpen}
            onSave={handleEventUpdate}
            projectId={project.id}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذه الفعالية؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الفعالية بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogAction onClick={confirmDelete}>
                نعم، احذف الفعالية
              </AlertDialogAction>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};