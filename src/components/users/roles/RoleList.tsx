
import { useState } from "react";
import { Role } from "../types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ShieldCheck } from "lucide-react";

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export const RoleList = ({
  roles,
  isLoading,
  selectedRoleId,
  onSelectRole,
  onEditRole,
  onDeleteRole
}: RoleListProps) => {
  if (isLoading) {
    return <div className="py-6 text-center text-muted-foreground">جاري تحميل الأدوار...</div>;
  }

  if (roles.length === 0) {
    return <div className="py-6 text-center text-muted-foreground">لا توجد أدوار محددة</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {roles.map((role) => (
        <div 
          key={role.id} 
          className={`flex items-center justify-between border-b border-border pb-3 ${
            selectedRoleId === role.id ? "bg-accent/30 p-2 rounded-md" : ""
          }`}
        >
          <div className="flex-1">
            <h3 className="font-medium">{role.name}</h3>
            <p className="text-sm text-muted-foreground">{role.description || "لا يوجد وصف"}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelectRole(role.id)}
              className="h-8 gap-1"
            >
              <ShieldCheck className="h-4 w-4" />
              الصلاحيات
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEditRole(role)}
              className="h-8 px-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDeleteRole(role)}
              className="h-8 px-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
