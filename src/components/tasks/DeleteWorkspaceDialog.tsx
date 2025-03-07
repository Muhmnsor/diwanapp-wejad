
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
import { useAuthStore } from "@/store/refactored-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    // Reset error state
    setError(null);

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
      console.log("Deleting workspace:", workspaceId, "by user:", user.id);
      
      // Call Supabase edge function to delete workspace
      const { data, error } = await supabase.functions.invoke('delete-workspace', {
        body: { 
          workspaceId, 
          userId: user.id 
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        setError(error.message || "فشلت عملية حذف مساحة العمل");
        setIsDeleting(false);
        return;
      }

      if (!data || !data.success) {
        console.error("Deletion failed:", data);
        setError(data?.error || "فشلت عملية حذف مساحة العمل");
        setIsDeleting(false);
        return;
      }

      toast.success("تم حذف مساحة العمل بنجاح");
      onOpenChange(false);
      
      // Navigate away from workspace page if we're currently viewing it
      if (window.location.pathname.includes(`/tasks/workspace/${workspaceId}`)) {
        navigate("/tasks");
      } else {
        // Force a refresh of the workspaces list
        window.location.href = "/tasks#workspaces";
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      setError("حدث خطأ أثناء حذف مساحة العمل");
      setIsDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isDeleting) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
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
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
            onClick={handleCloseDialog}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
