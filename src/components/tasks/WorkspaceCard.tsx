
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2,
  Clock,
  Users,
  UserPlus,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { Workspace } from "@/types/workspace";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkspaceMembersDialog } from "./WorkspaceMembersDialog";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const navigate = useNavigate();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const handleClick = () => {
    navigate(`/tasks/workspace/${workspace.id}`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to the details page
    setIsMembersDialogOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="mb-3">
            <h3 className="font-bold text-lg">{workspace.name}</h3>
          </div>
          
          <p className="text-gray-500 mb-4 text-sm line-clamp-2">
            {workspace.description || 'لا يوجد وصف'}
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{workspace.completed_tasks || 0} مشاريع مكتملة</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{workspace.pending_tasks || 0} مشاريع جارية</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>{workspace.total_tasks - (workspace.completed_tasks || 0) - (workspace.pending_tasks || 0) || 0} مشاريع متعثرة</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{workspace.members_count || 0} عضو</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleManageMembers}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">إدارة الأعضاء</span>
          </Button>
        </CardFooter>
      </Card>

      <WorkspaceMembersDialog 
        open={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        workspaceId={workspace.id}
      />
    </>
  );
};
