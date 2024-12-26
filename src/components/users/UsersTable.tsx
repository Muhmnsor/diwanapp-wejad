import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { User } from "./types";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { UserEditDialog } from "./UserEditDialog";
import { UserDeleteDialog } from "./UserDeleteDialog";

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
}

export const UsersTable = ({ users, onUserDeleted }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async () => {
    if (!selectedUser) {
      toast.error("الرجاء تحديد المستخدم");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.functions.invoke('manage-users', {
          body: {
            operation: 'update_password',
            userId: selectedUser.id,
            newPassword
          }
        });

        if (passwordError) throw passwordError;
      }

      // Update role if changed
      if (selectedRole && selectedRole !== selectedUser.role) {
        console.log('Updating user role:', { userId: selectedUser.id, newRole: selectedRole });
        
        const { error: roleError } = await supabase.functions.invoke('manage-users', {
          body: {
            operation: 'update_role',
            userId: selectedUser.id,
            newRole: selectedRole
          }
        });

        if (roleError) throw roleError;
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setSelectedUser(null);
      setNewPassword("");
      setSelectedRole("");
      onUserDeleted(); // Refresh the users list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
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
            <UserTableHeader />
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={() => {
                  setSelectedUser(user);
                  setSelectedRole(user.role || '');
                }}
                onDelete={() => setUserToDelete(user)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <UserEditDialog
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSubmit={handlePasswordChange}
        isSubmitting={isSubmitting}
      />

      <UserDeleteDialog
        user={userToDelete}
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </>
  );
};