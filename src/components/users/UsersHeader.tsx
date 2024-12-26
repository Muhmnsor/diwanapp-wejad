import { CreateUserDialog } from "./CreateUserDialog";
import type { Role } from "./types";

interface UsersHeaderProps {
  roles: Role[];
  onUserCreated: () => void;
}

export const UsersHeader = ({ roles, onUserCreated }: UsersHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
      <CreateUserDialog roles={roles} onUserCreated={onUserCreated} />
    </div>
  );
};