
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCog, Trash2, Info } from "lucide-react";
import { User } from "./types";

interface UserTableRowProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

export const UserTableRow = ({ user, onEdit, onDelete, onViewDetails }: UserTableRowProps) => {
  const getRoleDisplayName = (roleName: string | undefined) => {
    if (!roleName || roleName === 'لم يتم تعيين دور') return 'لم يتم تعيين دور';
    
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <TableRow dir="rtl">
      <TableCell className="text-right">
        <div className="space-y-1">
          <div className="font-medium">
            {user.displayName || user.username}
            {user.displayName && (
              <span className="text-sm text-muted-foreground mr-2 font-normal">
                ({user.username})
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">{user.lastLogin}</TableCell>
      <TableCell className="text-center">
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onViewDetails}
            title="عرض التفاصيل"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onEdit}
            title="تعديل المستخدم"
          >
            <UserCog className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={onDelete}
            title="حذف المستخدم"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
