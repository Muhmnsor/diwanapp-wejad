import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectActivity } from "@/types/activity";

export const useActivityManagement = (projectId: string, refetchActivities: () => void) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddEvent = () => {
    setIsAddEventOpen(true);
  };

  const handleEditEvent = (projectEvent: any) => {
    console.log("Editing project event:", projectEvent);
    setSelectedEvent(projectEvent);
    setIsEditEventOpen(true);
  };

  const handleDeleteEvent = (event: any) => {
    console.log("Handling delete for event:", event);
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Starting delete process for event:", selectedEvent);

      // Delete the event directly since it's a project activity
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id)
        .eq('project_id', projectId);

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