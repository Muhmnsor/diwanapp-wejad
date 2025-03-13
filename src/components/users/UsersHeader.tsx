
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Role, User } from "./types";
import { AddUserDialog } from "./AddUserDialog";
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";

interface UsersHeaderProps {
  roles: Role[];
  users: User[];
  onUserCreated: () => void;
  canCreateUsers?: boolean;
}

export const UsersHeader = ({ roles, users, onUserCreated, canCreateUsers = false }: UsersHeaderProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { hasPermission } = useDetailedPermissions();

  // Double-check permission directly in component
  const hasCreatePermission = canCreateUsers || hasPermission('users_create');

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">إدارة المستخدمين ({users.length})</h2>
      
      {hasCreatePermission && (
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مستخدم
        </Button>
      )}
      
      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        roles={roles}
        onUserCreated={onUserCreated}
      />
    </div>
  );
};
