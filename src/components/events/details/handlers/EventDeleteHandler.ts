import { handleEventDeletion } from "../EventDeletionHandler";
import { toast } from "sonner";

interface DeleteHandlerProps {
  id: string;
  onSuccess: () => void;
}

export const handleEventDelete = async ({ id, onSuccess }: DeleteHandlerProps) => {
  try {
    await handleEventDeletion({
      eventId: id,
      onSuccess: () => {
        onSuccess();
      }
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    toast.error('حدث خطأ أثناء حذف الفعالية');
  }
};