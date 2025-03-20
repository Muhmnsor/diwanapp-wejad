
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  onSuccess?: () => void;
}

export const DeleteFolderDialog = ({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: DeleteFolderDialogProps) => {
  const { mutate: deleteFolder, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("meeting_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`حدث خطأ أثناء حذف التصنيف: ${error.message}`);
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteFolder();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف التصنيف</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ ستبقى الاجتماعات المرتبطة به ولكن سيتم إزالة ارتباطها بهذا التصنيف.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
