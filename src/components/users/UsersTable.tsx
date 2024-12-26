import { useState } from "react";
import { UserCog, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { User } from "./types";

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
}

export const UsersTable = ({ users, onUserDeleted }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleDisplayName = (roleName: string | undefined) => {
    if (!roleName) return 'لم يتم تعيين دور';
    
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUser || !newPassword) {
      toast.error("الرجاء إدخال كلمة المرور الجديدة");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'update_password',
          userId: selectedUser.id,
          newPassword
        }
      });

      if (error) throw error;

      toast.success("تم تغيير كلمة المرور بنجاح");
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'delete_user',
          userId: userToDelete.id
        }
      });

      if (error) throw error;

      toast.success("تم حذف المستخدم بنجاح");
      onUserDeleted();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] text-right">معلومات المستخدم</TableHead>
              <TableHead className="text-right">آخر تسجيل دخول</TableHead>
              <TableHead className="w-[100px] text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{getRoleDisplayName(user.role)}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedUser(user)}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="font-medium">البريد الإلكتروني</div>
              <div>{selectedUser?.username}</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">كلمة المرور الجديدة</div>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
              />
            </div>
          </div>
          <Button 
            onClick={handlePasswordChange}
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستخدم {userToDelete?.username} نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={handleDeleteUser}>حذف</AlertDialogAction>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};