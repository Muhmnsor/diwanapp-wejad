
import { Role } from "../types";
import { RolePermissions } from "../RolePermissions";
import { ShieldAlert } from "lucide-react";

interface PermissionsTabContentProps {
  selectedRole: Role | undefined;
}

export const PermissionsTabContent = ({ selectedRole }: PermissionsTabContentProps) => {
  if (!selectedRole) {
    return (
      <div className="py-12 text-center bg-muted/20 rounded-md flex flex-col items-center gap-3 mt-4" dir="rtl">
        <ShieldAlert className="h-12 w-12 text-muted-foreground/70" />
        <div className="text-muted-foreground max-w-md">
          <p className="font-medium mb-1">الرجاء اختيار دور من القائمة</p>
          <p className="text-sm">قم باختيار دور من قائمة الأدوار لعرض وتعديل الصلاحيات المرتبطة به</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <RolePermissions role={selectedRole} />
    </div>
  );
};
