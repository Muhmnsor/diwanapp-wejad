
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserDeleted: () => void;
}

export const DeleteUserDialog = ({ open, onOpenChange, user, onUserDeleted }: DeleteUserDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      // Update profile to mark as inactive
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Use RPC function to soft delete the user instead of direct admin API call
      const { error: softDeleteError } = await supabase
        .rpc('soft_delete_user', { user_id: user.id });

      if (softDeleteError) throw softDeleteError;

      toast.success("تم تعطيل المستخدم بنجاح");
      handleClose();
      onUserDeleted();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء تعطيل المستخدم");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعطيل المستخدم</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-right">
          <p className="mb-4">
            هل أنت متأكد من رغبتك في تعطيل المستخدم <strong>{user.username}</strong>؟
          </p>
          <p className="text-sm text-muted-foreground">
            سيتم تعطيل حساب المستخدم ومنعه من تسجيل الدخول، مع الحفاظ على البيانات المرتبطة به لأغراض الأرشفة.
          </p>
        </div>
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button 
            variant="destructive" 
            onClick={handleDeleteUser} 
            disabled={isDeleting}
          >
            {isDeleting ? "جارِ التعطيل..." : "تعطيل المستخدم"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
