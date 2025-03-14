
import React from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
  requestTitle?: string;
}

export const DeleteRequestDialog = ({
  isOpen,
  onOpenChange,
  requestId,
  requestTitle,
}: DeleteRequestDialogProps) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!requestId) return;
    
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      console.log("Attempting to delete request:", requestId);
      
      const { data, error } = await supabase.rpc('delete_request', {
        p_request_id: requestId
      });
      
      if (error) {
        console.error("Error deleting request:", error);
        setErrorMessage(error.message || "فشل في حذف الطلب");
        toast.error(error.message || "فشل في حذف الطلب");
        return;
      }
      
      if (!data.success) {
        console.error("Request deletion failed:", data);
        setErrorMessage(data.message || "فشل في حذف الطلب");
        toast.error(data.message || "فشل في حذف الطلب");
        return;
      }
      
      console.log("Request deleted successfully:", data);
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ["requests"]
      });
      
      // Show success message
      toast.success("تم حذف الطلب بنجاح");
      
      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Exception deleting request:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء محاولة حذف الطلب");
      toast.error(error.message || "حدث خطأ أثناء محاولة حذف الطلب");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
          <AlertDialogDescription>
            {requestTitle ? (
              <>سيتم حذف الطلب <strong>"{requestTitle}"</strong> وجميع بياناته بشكل نهائي.</>
            ) : (
              <>سيتم حذف الطلب وجميع بياناته بشكل نهائي.</>
            )}
            <br />
            لا يمكن التراجع عن هذه العملية بعد التأكيد.
          </AlertDialogDescription>
          
          {errorMessage && (
            <div className="mt-2 text-sm text-red-500">
              <p>خطأ: {errorMessage}</p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              "نعم، احذف الطلب"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
