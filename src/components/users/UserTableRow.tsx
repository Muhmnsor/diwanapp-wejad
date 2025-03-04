
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCog, Trash2, Info, AlertCircle } from "lucide-react";
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
    <TableRow dir="rtl" className={!user.isActive ? "bg-muted/20" : ""}>
      <TableCell className="text-right">
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {user.username}
            {!user.isActive && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm">
                معطل
              </span>
            )}
            {user.displayName && (
              <span className="text-sm text-muted-foreground mr-2 font-normal">
                ({user.displayName})
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {user.displayName && user.displayName.trim() !== '' ? user.displayName : 'لا يوجد مسمى شخصي'}
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
            disabled={!user.isActive}
          >
            <UserCog className="h-4 w-4" />
          </Button>
          {user.isActive ? (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={onDelete}
              title="تعطيل المستخدم"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDelete}
              disabled
              title="مستخدم معطل بالفعل"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
