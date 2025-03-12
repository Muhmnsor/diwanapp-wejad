
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
import { useAuthStore } from "@/store/refactored-auth";

interface RoleDeleteDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const RoleDeleteDialog = ({ role, isOpen, onClose, onDelete }: RoleDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!role) return;
    if (!user) {
      toast.error("يجب تسجيل الدخول لحذف الأدوار");
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Deleting role:", role.id);
      
      // التحقق من المستخدمين المرتبطين بهذا الدور
      const { data: userRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role_id', role.id);

      if (checkError) {
        console.error("Error checking user roles:", checkError);
        throw checkError;
      }

      if (userRoles && userRoles.length > 0) {
        toast.error(`لا يمكن حذف الدور "${role.name}" لأنه مخصص لـ ${userRoles.length} مستخدم`);
        setIsDeleting(false);
        return;
      }

      // حذف تسجيلات الصلاحيات المرتبطة بالدور
      try {
        const { error: permissionsError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', role.id);

        if (permissionsError) {
          console.warn("Error deleting role permissions:", permissionsError);
          // Continue even if permissions deletion fails
        }
      } catch (permError) {
        console.warn("Error during permissions deletion:", permError);
        // Continue even if permissions deletion fails
      }

      try {
        const { error: appPermissionsError } = await supabase
          .from('app_permissions')
          .delete()
          .eq('role_id', role.id);

        if (appPermissionsError) {
          console.warn("Error deleting app permissions:", appPermissionsError);
          // Continue even if app permissions deletion fails
        }
      } catch (appPermError) {
        console.warn("Error during app permissions deletion:", appPermError);
        // Continue even if app permissions deletion fails
      }

      // حذف الدور
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (roleError) {
        console.error("Error deleting role:", roleError);
        throw roleError;
      }

      // تسجيل نشاط المستخدم
      try {
        await supabase.rpc('log_user_activity', {
          user_id: user.id,
          activity_type: 'role_delete',
          details: `تم حذف الدور: ${role.name}`
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
        // Non-critical, continue even if activity logging fails
      }

      toast.success(`تم حذف الدور "${role.name}" بنجاح`);
      onDelete();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      
      // Display more helpful error messages
      if (error.code === "42501") {
        toast.error("ليست لديك صلاحية لحذف الأدوار");
      } else {
        toast.error(`حدث خطأ أثناء حذف الدور: ${error.message || error}`);
      }
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
