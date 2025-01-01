import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectActivity } from "@/types/activity";

export const useActivityManagement = (projectId: string, refetchActivities: () => Promise<void>) => {
  const [selectedEvent, setSelectedEvent] = useState<ProjectActivity | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddEvent = () => {
    setIsAddEventOpen(true);
  };

  const handleEditEvent = (projectEvent: ProjectActivity) => {
    console.log("Editing project event:", projectEvent);
    setSelectedEvent(projectEvent);
    setIsEditEventOpen(true);
  };

  const handleDeleteEvent = (event: ProjectActivity) => {
    console.log("Handling delete for event:", event);
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Starting delete process for event:", selectedEvent);

      if (!selectedEvent) {
        throw new Error("No event selected for deletion");
      }

      // Delete attendance records first
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('activity_id', selectedEvent.id);

      if (attendanceError) {
        console.error('Error deleting attendance records:', attendanceError);
        throw attendanceError;
      }

      // Delete activity reports
      const { error: reportsError } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('activity_id', selectedEvent.id);

      if (reportsError) {
        console.error('Error deleting activity reports:', reportsError);
        throw reportsError;
      }

      // Finally delete the event itself
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (eventError) {
        console.error('Error deleting event:', eventError);
        throw eventError;
      }

      toast.success('تم حذف النشاط بنجاح');
      await refetchActivities();
    } catch (error) {
      console.error('Error in delete process:', error);
      toast.error('حدث خطأ أثناء حذف النشاط');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  return {
    selectedEvent,
    isAddEventOpen,
    setIsAddEventOpen,
    isEditEventOpen,
    setIsEditEventOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    confirmDelete,
  };
};