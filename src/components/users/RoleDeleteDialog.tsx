
import { useState } from "react";
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
import { Role } from "./types";

interface RoleDeleteDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const RoleDeleteDialog = ({ role, isOpen, onClose, onDelete }: RoleDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!role) return;

    setIsDeleting(true);
    try {
      // التحقق من المستخدمين المرتبطين بهذا الدور
      const { data: userRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role_id', role.id);

      if (checkError) throw checkError;

      if (userRoles && userRoles.length > 0) {
        toast.error(`لا يمكن حذف الدور "${role.name}" لأنه مخصص لـ ${userRoles.length} مستخدم`);
        return;
      }

      // حذف تسجيلات الصلاحيات المرتبطة بالدور
      const { error: permissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      if (permissionsError) throw permissionsError;

      // حذف الدور
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (roleError) throw roleError;

      // تسجيل نشاط المستخدم
      await supabase.rpc('log_user_activity', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: 'role_delete',
        details: `تم حذف الدور: ${role.name}`
      });

      onDelete();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("حدث خطأ أثناء حذف الدور");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!role) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا الدور؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف الدور "{role.name}" نهائيًا. لا يمكن التراجع عن هذا الإجراء.
            <br />
            <br />
            ملاحظة: لا يمكن حذف الأدوار المخصصة لمستخدمين.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جار الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
