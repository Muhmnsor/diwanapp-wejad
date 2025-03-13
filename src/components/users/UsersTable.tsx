
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Loader2 } from "lucide-react";
import { User } from "./types";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
  canDeleteUsers?: boolean;
  canEditUsers?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const UsersTable = ({ 
  users, 
  onUserDeleted, 
  canDeleteUsers = false,
  canEditUsers = false,
  isLoading = false,
  error = null
}: UsersTableProps) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { hasPermission } = useDetailedPermissions();

  // Double-check permissions directly in component
  const hasDeletePermission = canDeleteUsers || hasPermission('users_delete');
  const hasEditPermission = canEditUsers || hasPermission('users_edit');

  if (isLoading) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">جاري تحميل بيانات المستخدمين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center text-muted-foreground">
          <p>لا يوجد مستخدمين</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم المستخدم</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">آخر تسجيل دخول</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin ? 
                  formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true, locale: arSA }) : 
                  'لم يسجل الدخول بعد'}
              </TableCell>
              <TableCell>
                {user.isActive !== false ? 
                  <Badge variant="default" className="bg-green-500">نشط</Badge> : 
                  <Badge variant="secondary" className="bg-gray-500">غير نشط</Badge>}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  {hasEditPermission && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUserToEdit(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {hasDeletePermission && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUserToDelete(user)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteUserDialog 
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        user={userToDelete}
        onUserDeleted={onUserDeleted}
      />

      <EditUserDialog 
        open={userToEdit !== null}
        onOpenChange={(open) => !open && setUserToEdit(null)}
        user={userToEdit}
        onUserEdited={onUserDeleted}
      />
    </div>
  );
};
