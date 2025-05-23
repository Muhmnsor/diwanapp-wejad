
import { useState, useEffect } from "react";
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
import { UserDetailsDialog } from "./UserDetailsDialog";
import { SearchFilter } from "./table/SearchFilter";
import { EmptyState } from "./table/TableStates";
import { useUserOperations } from "./hooks/useUserOperations";
import { useUsersData } from "./hooks/useUsersData";

interface UsersTableProps {
  users: User[];
  onUserDeleted: () => void;
}

export const UsersTable = ({ users, onUserDeleted }: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  
  // Get roles data for UserEditDialog
  const { roles } = useUsersData();
  
  const {
    selectedUser,
    setSelectedUser,
    userToDelete,
    setUserToDelete,
    userToView,
    setUserToView,
    newPassword,
    setNewPassword,
    selectedRole,
    setSelectedRole,
    isSubmitting,
    handlePasswordChange,
    handleDeleteUser
  } = useUserOperations(onUserDeleted);

  useEffect(() => {
    // Filter users based on search term and active status
    let filtered = users;
    
    if (showActiveOnly) {
      filtered = filtered.filter(user => user.isActive !== false);
    }
    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, users, showActiveOnly]);

  return (
    <div className="w-full" dir="rtl">
      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={users.length}
        filteredCount={filteredUsers.length}
        showActiveOnly={showActiveOnly}
        onToggleActiveFilter={setShowActiveOnly}
      />

      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <UserTableHeader />
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEdit={() => {
                    setSelectedUser(user);
                    setSelectedRole(user.role || '');
                  }}
                  onDelete={() => setUserToDelete(user)}
                  onViewDetails={() => setUserToView(user)}
                />
              ))
            ) : (
              <EmptyState hasSearchTerm={searchTerm.trim() !== ""} />
            )}
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
        roles={roles}
      />

      <UserDeleteDialog
        user={userToDelete}
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />

      <UserDetailsDialog
        user={userToView}
        isOpen={!!userToView}
        onClose={() => setUserToView(null)}
      />
    </div>
  );
};
