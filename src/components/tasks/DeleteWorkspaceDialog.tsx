
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

export const DeleteWorkspaceDialog = ({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
}: DeleteWorkspaceDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    // Ask for final confirmation before deletion
    const shouldDelete = await confirm({
      title: "تأكيد حذف مساحة العمل",
      description: `هل أنت متأكد من حذف مساحة العمل "${workspaceName}" نهائياً؟ لا يمكن التراجع عن هذه العملية وسيتم حذف جميع المشاريع والمهام المرتبطة بها.`,
      confirmText: "نعم، احذف مساحة العمل",
      cancelText: "إلغاء"
    });

    if (!shouldDelete) return;

    setIsDeleting(true);
    try {
      // Call Supabase function to delete workspace
      const { data, error } = await supabase.rpc('delete_workspace', {
        p_workspace_id: workspaceId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        throw error;
      }

      if (data !== true) {
        throw new Error("فشلت عملية حذف مساحة العمل");
      }

      toast.success("تم حذف مساحة العمل بنجاح");
      onOpenChange(false);
      navigate("/tasks"); // Navigate back to workspaces list
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("حدث خطأ أثناء حذف مساحة العمل");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>حذف مساحة العمل</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف مساحة العمل "{workspaceName}"؟
          </DialogDescription>
        </DialogHeader>
        <p className="text-destructive text-sm font-medium">
          سيؤدي هذا الإجراء إلى حذف مساحة العمل وجميع المشاريع والمهام المرتبطة بها.
        </p>
        <DialogFooter className="flex-row-reverse sm:justify-start gap-2 mt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "جاري الحذف..." : "حذف مساحة العمل"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
