
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "../types";

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: string | null;
  onRoleChange: (value: string) => void;
}

export const RoleSelector = ({
  roles,
  selectedRole,
  onRoleChange,
}: RoleSelectorProps) => {
  // ترجمة اسم الدور للعربية
  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <div className="space-y-2 text-right">
      <div className="font-medium">الدور الجديد</div>
      {roles.length > 0 ? (
        <Select
          value={selectedRole || ''}
          onValueChange={(value) => {
            console.log('تم اختيار الدور الجديد:', value);
            const role = roles.find(r => r.id === value);
            console.log('معلومات الدور المختار:', role);
            onRoleChange(value);
          }}
        >
          <SelectTrigger className="w-full text-right">
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {getRoleDisplayName(role.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-sm text-muted-foreground">لا توجد أدوار متاحة</div>
      )}
    </div>
  );
};
