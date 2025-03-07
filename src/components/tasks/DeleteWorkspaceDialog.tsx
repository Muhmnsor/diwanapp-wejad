
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
import { useAuthStore } from "@/store/refactored-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspacePermissions } from "./workspace-card/useWorkspacePermissions";

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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { canEdit, isLoading: permissionsLoading } = useWorkspacePermissions({ 
    id: workspaceId 
  }, user);

  const handleDelete = async () => {
    if (!user) {
      console.error("[DeleteWorkspace] Operation failed: No authenticated user");
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    // Reset error state
    setError(null);
    setIsDeleting(true);
    
    console.log("[DeleteWorkspace] Starting deletion process for workspace:", workspaceId);
    console.log("[DeleteWorkspace] User ID:", user.id);
    console.log("[DeleteWorkspace] Timestamp:", new Date().toISOString());
    
    try {
      // Verify permissions first
      if (!canEdit && !permissionsLoading) {
        console.error("[DeleteWorkspace] User doesn't have permission to delete this workspace");
        throw new Error("ليس لديك صلاحية لحذف مساحة العمل");
      }
      
      // Call Supabase edge function to delete workspace with explicit parameter names
      console.log("[DeleteWorkspace] Calling delete-workspace edge function with params:", { workspaceId, userId: user.id });
      
      const { data, error: functionError } = await supabase.functions.invoke('delete-workspace', {
        body: { 
          workspaceId: workspaceId, 
          userId: user.id 
        }
      });

      if (functionError) {
        console.error("[DeleteWorkspace] Edge function error:", functionError);
        console.error("[DeleteWorkspace] Error details:", JSON.stringify(functionError));
        setError(functionError.message || "فشلت عملية حذف مساحة العمل");
        setIsDeleting(false);
        return;
      }

      console.log("[DeleteWorkspace] Edge function response:", data);

      if (!data || !data.success) {
        console.error("[DeleteWorkspace] Deletion failed, edge function response:", data);
        setError(data?.error || "فشلت عملية حذف مساحة العمل");
        setIsDeleting(false);
        return;
      }

      // Invalidate queries to refresh workspaces data
      console.log("[DeleteWorkspace] Invalidating workspaces queries");
      queryClient.invalidateQueries({queryKey: ['workspaces']});
      
      toast.success("تم حذف مساحة العمل بنجاح");
      console.log("[DeleteWorkspace] Workspace deleted successfully");
      onOpenChange(false);
      
      // Navigate away from workspace page if we're currently viewing it
      if (window.location.pathname.includes(`/tasks/workspace/${workspaceId}`)) {
        console.log("[DeleteWorkspace] Navigating away from deleted workspace page");
        navigate("/tasks");
      }
    } catch (error) {
      console.error("[DeleteWorkspace] Unexpected error during deletion:", error);
      console.error("[DeleteWorkspace] Error details:", JSON.stringify(error));
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء حذف مساحة العمل");
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
            <strong className="block mt-2 text-destructive">
              لا يمكن التراجع عن هذه العملية وسيتم حذف جميع المشاريع والمهام المرتبطة بها.
            </strong>
          </DialogDescription>
        </DialogHeader>
        
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
            disabled={isDeleting || (permissionsLoading || (!permissionsLoading && !canEdit))}
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
