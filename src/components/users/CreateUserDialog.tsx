import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Role } from "./types";
import { UserFormFields } from "./UserFormFields";

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

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        throw signUpError;
      }

      if (!authUser.user) {
        throw new Error('No user data returned');
      }

      console.log('User created successfully:', authUser.user.id);

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: authUser.user.id,
            role_id: selectedRole
          }
        ]);

      if (roleError) {
        console.error('Error assigning role:', roleError);
        throw roleError;
      }

      console.log('Role assigned successfully');
      toast.success("تم إضافة المستخدم بنجاح");
      setIsOpen(false);
      setNewUsername("");
      setNewPassword("");
      setSelectedRole("");
      onUserCreated();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setIsSubmitting(false);
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
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          <DialogDescription className="text-right">
            قم بإدخال بيانات المستخدم الجديد وتحديد دوره في النظام
          </DialogDescription>
        </DialogHeader>
        <UserFormFields
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          roles={roles}
        />
        <Button 
          onClick={handleAddUser} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الإضافة..." : "إضافة المستخدم"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};