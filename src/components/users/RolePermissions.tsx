
import { RolePermissionsView } from "./permissions/RolePermissionsView";
import { Role } from "./types";

interface RolePermissionsProps {
  role: Role;
}

export const RolePermissions = ({ role }: RolePermissionsProps) => {
  return <RolePermissionsView role={role} />;
};
