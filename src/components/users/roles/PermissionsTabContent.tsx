
import { Role } from "../types";
import { RolePermissions } from "../RolePermissions";

interface PermissionsTabContentProps {
  selectedRole: Role | undefined;
}

export const PermissionsTabContent = ({ selectedRole }: PermissionsTabContentProps) => {
  if (!selectedRole) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        الرجاء اختيار دور لعرض وتعديل الصلاحيات
      </div>
    );
  }

  return (
    <div className="mt-4">
      <RolePermissions role={selectedRole} />
    </div>
  );
};
