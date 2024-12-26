import { useState } from "react";
import { UserCog } from "lucide-react";
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
import { User } from "./types";

interface UsersTableProps {
  users: User[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">معلومات المستخدم</TableHead>
              <TableHead>آخر تسجيل دخول</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{getRoleDisplayName(user.role)}</div>
                  </div>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSelectedUser(user)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
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
    </>
  );
};