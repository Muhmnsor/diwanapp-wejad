
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Role } from "../types";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/permissions/PermissionGate";

interface RolesListTabContentProps {
  roles: Role[];
  onRoleSelected: (roleId: string) => void;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
}

export const RolesListTabContent = ({
  roles,
  onRoleSelected,
  onEditRole,
  onDeleteRole
}: RolesListTabContentProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم الدور</TableHead>
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow 
              key={role.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRoleSelected(role.id)}
            >
              <TableCell className="font-medium">
                {role.name}
                {role.name === 'admin' && (
                  <Badge className="mr-2 bg-red-500">مدير النظام</Badge>
                )}
                {role.name === 'developer' && (
                  <Badge className="mr-2 bg-blue-500">مطور</Badge>
                )}
              </TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <PermissionGate permission="roles_edit">
                    {onEditRole && role.name !== 'admin' && role.name !== 'developer' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRole(role);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </PermissionGate>
                  
                  <PermissionGate permission="roles_delete">
                    {onDeleteRole && role.name !== 'admin' && role.name !== 'developer' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRole(role);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </PermissionGate>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
