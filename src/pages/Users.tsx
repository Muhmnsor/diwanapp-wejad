import { Navigation } from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Users = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // التحقق من صلاحيات المستخدم
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // بيانات المستخدمين (يمكن ربطها لاحقاً بقاعدة البيانات)
  const users = [
    { id: "1", username: "admin", role: "مشرف", lastLogin: "2024-03-20" },
  ];

  const handleAddUser = () => {
    if (!newUsername || !newPassword) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    // هنا يمكن إضافة المنطق لإضافة المستخدم إلى قاعدة البيانات
    toast.success("تم إضافة المستخدم بنجاح");
    setIsOpen(false);
    setNewUsername("");
    setNewPassword("");
    setIsAdmin(false);
  };

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم المستخدم</Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="ml-2"
                  />
                  <Label htmlFor="isAdmin">صلاحيات مشرف</Label>
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  إضافة المستخدم
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>آخر تسجيل دخول</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Users;