
import { Role } from "../types";
import { RolePermissionsView } from "../permissions/RolePermissionsView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PermissionsTabContentProps {
  selectedRole: Role | null;
}

export const PermissionsTabContent = ({ selectedRole }: PermissionsTabContentProps) => {
  if (!selectedRole) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          الرجاء اختيار دور أولاً لعرض وتعديل الصلاحيات
        </AlertDescription>
      </Alert>
    );
  }

  return <RolePermissionsView role={selectedRole} />;
};
