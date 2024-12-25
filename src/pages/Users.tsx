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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string;
  role: string;
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

const Users = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Fetch roles from the database
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('Fetching roles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      return data as Role[];
    }
  });

  // Fetch users with their roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles (
            name,
            description
          )
        `);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      return userRoles.map(ur => ({
        id: ur.user_id,
        role: ur.roles?.name || 'No role',
        username: ur.user_id, // In a real app, you'd fetch the username from auth.users
        lastLogin: '-'
      }));
    }
  });

  // التحقق من صلاحيات المستخدم
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddUser = async () => {
    if (!newUsername || !newPassword || !selectedRole) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    try {
      // Create user in auth system
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: newUsername,
        password: newPassword,
      });

      if (signUpError) throw signUpError;

      if (authUser.user) {
        // Assign role to user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            {
              user_id: authUser.user.id,
              role_id: selectedRole
            }
          ]);

        if (roleError) throw roleError;

        toast.success("تم إضافة المستخدم بنجاح");
        setIsOpen(false);
        setNewUsername("");
        setNewPassword("");
        setSelectedRole("");
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    }
  };

  if (usersLoading || rolesLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

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
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    type="email"
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
                <div className="space-y-2">
                  <Label>الدور</Label>
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                    className="flex flex-col space-y-2"
                  >
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={role.id} id={role.id} />
                        <Label htmlFor={role.id} className="mr-2">
                          {role.name === 'admin' ? 'مشرف' :
                           role.name === 'event_creator' ? 'منشئ فعاليات' :
                           role.name === 'event_executor' ? 'منفذ فعاليات' :
                           role.name === 'event_media' ? 'إعلامي' : role.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
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
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>آخر تسجيل دخول</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.role === 'admin' ? 'مشرف' :
                     user.role === 'event_creator' ? 'منشئ فعاليات' :
                     user.role === 'event_executor' ? 'منفذ فعاليات' :
                     user.role === 'event_media' ? 'إعلامي' : user.role}
                  </TableCell>
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