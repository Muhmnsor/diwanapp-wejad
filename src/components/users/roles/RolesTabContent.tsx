
import { useState } from "react";
import { Role } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { RoleList } from "./RoleList";
import { Input } from "@/components/ui/input";

interface RolesTabContentProps {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  onAddRole: () => void;
  onSelectRole: (roleId: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export const RolesTabContent = ({
  roles,
  isLoading,
  selectedRoleId,
  onAddRole,
  onSelectRole,
  onEditRole,
  onDeleteRole
}: RolesTabContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // تصفية الأدوار بناءً على استعلام البحث
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن دور..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10"
          />
        </div>
        <Button onClick={onAddRole} className="gap-1 whitespace-nowrap">
          <Plus className="h-4 w-4 ml-1" />
          إضافة دور جديد
        </Button>
      </div>
      
      <RoleList 
        roles={filteredRoles}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
        onEditRole={onEditRole}
        onDeleteRole={onDeleteRole}
      />
    </div>
  );
};
