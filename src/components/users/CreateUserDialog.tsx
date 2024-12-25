import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Role } from "./types";

interface CreateUserDialogProps {
  roles: Role[];
  onUserCreated: () => void;
}

export const CreateUserDialog = ({ roles, onUserCreated }: CreateUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!newUsername || !newPassword || !selectedRole) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating new user with role:', selectedRole);
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: newUsername,
        password: newPassword,
      });

      if (signUpError) throw signUpError;

      if (authUser.user) {
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
        onUserCreated();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2" />
          إضافة مستخدم
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
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
                <div key={role.id} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={role.id} id={role.id} />
                  <Label htmlFor={role.id} className="mr-2">
                    {getRoleDisplayName(role.name)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button 
            onClick={handleAddUser} 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإضافة..." : "إضافة المستخدم"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};