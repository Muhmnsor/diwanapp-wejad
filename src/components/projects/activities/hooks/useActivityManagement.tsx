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
    console.log("Deleting project event:", event);
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Confirming delete for event:", selectedEvent);

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id)
        .eq('project_id', projectId);

      if (error) throw error;

      toast.success('تم حذف النشاط بنجاح');
      await refetchActivities();
    } catch (error) {
      console.error('Error deleting event:', error);
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