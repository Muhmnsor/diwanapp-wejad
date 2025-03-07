
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
import { AlertCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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
      console.log("Deleting workspace:", workspaceId, "by user:", user.id, "Attempt:", retryCount + 1);
      
      // Try direct database function call first
      console.log("Trying direct RPC call to delete_workspace function");
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('delete_workspace', { 
          p_workspace_id: workspaceId,
          p_user_id: user.id 
        });
        
      if (rpcError) {
        console.error("RPC function error:", rpcError);
        
        // If RPC fails, try using the edge function as fallback
        console.log("RPC failed, falling back to edge function");
        const { data, error } = await supabase.functions.invoke('delete-workspace', {
          body: { 
            workspaceId, 
            userId: user.id 
          }
        });

        console.log("Edge function response:", data, error);

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
      } else {
        console.log("RPC function successful:", rpcData);
        if (rpcData !== true) {
          setError("فشلت عملية حذف مساحة العمل لأسباب غير معروفة");
          setIsDeleting(false);
          return;
        }
      }

      console.log("Workspace deleted successfully");
      toast.success("تم حذف مساحة العمل بنجاح");
      onOpenChange(false);
      
      // Invalidate queries to refresh workspace data
      queryClient.invalidateQueries({queryKey: ['workspaces']});
      
      // Navigate away from workspace page if we're currently viewing it
      if (window.location.pathname.includes(`/tasks/workspace/${workspaceId}`)) {
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      setError("حدث خطأ أثناء حذف مساحة العمل");
      setIsDeleting(false);
    }
  };

  const handleRetryDelete = () => {
    setRetryCount(prev => prev + 1);
    handleDelete();
  };

  const handleCloseDialog = () => {
    if (!isDeleting) {
      setError(null);
      setRetryCount(0);
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
            onClick={error ? handleRetryDelete : handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : error ? (
              "إعادة المحاولة"
            ) : (
              "حذف مساحة العمل"
            )}
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
