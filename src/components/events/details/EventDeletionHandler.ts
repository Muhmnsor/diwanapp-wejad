import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventDeletionProps {
  eventId: string;
  onSuccess: () => void;
}

export const handleEventDeletion = async ({ eventId, onSuccess }: EventDeletionProps) => {
  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) throw error;

    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error("Error deleting event:", error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};