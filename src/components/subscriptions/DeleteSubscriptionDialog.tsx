
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteSubscriptionDialogProps {
  subscriptionId: string | null;
  subscriptionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export const DeleteSubscriptionDialog = ({
  subscriptionId,
  subscriptionName,
  open,
  onOpenChange,
  onDelete,
}: DeleteSubscriptionDialogProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!subscriptionId) return;
    
    setIsDeleting(true);
    try {
      // First, delete any attachments
      const { error: attachmentsError } = await supabase
        .from('subscription_attachments')
        .delete()
        .eq('subscription_id', subscriptionId);

      if (attachmentsError) {
        console.error("Error deleting attachments:", attachmentsError);
        throw attachmentsError;
      }

      // Then delete the subscription
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        console.error("Error deleting subscription:", error);
        throw error;
      }

      toast.success("تم حذف الاشتراك بنجاح");
      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("حدث خطأ أثناء حذف الاشتراك");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا الاشتراك؟</AlertDialogTitle>
          <AlertDialogDescription>
            أنت على وشك حذف الاشتراك "{subscriptionName}". هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
