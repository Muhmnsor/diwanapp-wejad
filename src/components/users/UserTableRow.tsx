import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCog, Trash2 } from "lucide-react";
import { User } from "./types";

interface UserTableRowProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

export const UserTableRow = ({ user, onEdit, onDelete }: UserTableRowProps) => {
  const getRoleDisplayName = (roleName: string | undefined) => {
    if (!roleName) return 'لم يتم تعيين دور';
    
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <TableRow>
      <TableCell className="text-right">
        <div className="space-y-1">
          <div className="font-medium">{user.username}</div>
          <div className="text-sm text-muted-foreground">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">{user.lastLogin}</TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onEdit}
          >
            <UserCog className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};