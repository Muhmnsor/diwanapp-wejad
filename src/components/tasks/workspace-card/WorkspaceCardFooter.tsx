
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceCardFooterProps {
  membersCount: number;
  onManageMembers: (e: React.MouseEvent) => void;
}

export const WorkspaceCardFooter = ({
  membersCount,
  onManageMembers
}: WorkspaceCardFooterProps) => {
  return (
    <div className="px-6 py-4 border-t flex justify-between">
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        <span>{membersCount} عضو</span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1"
        onClick={onManageMembers}
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">إدارة الأعضاء</span>
      </Button>
    </div>
  );
};
