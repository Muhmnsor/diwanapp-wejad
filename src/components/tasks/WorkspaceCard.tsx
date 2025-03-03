
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  UserPlus
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
  
  const calculateProgress = () => {
    const totalTasks = workspace.total_tasks || 0;
    const completedTasks = workspace.completed_tasks || 0;
    
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const handleClick = () => {
    navigate(`/workspaces/${workspace.id}`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar la navegación a la página de detalles
    setIsMembersDialogOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg">{workspace.name}</h3>
            <Badge variant={workspace.status === 'active' ? 'default' : 'outline'}>
              {workspace.status === 'active' ? 'نشط' : 'غير نشط'}
            </Badge>
          </div>
          
          <p className="text-gray-500 mb-4 text-sm line-clamp-2">
            {workspace.description || 'لا يوجد وصف'}
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{workspace.completed_tasks || 0} مكتمل</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>{workspace.pending_tasks || 0} قيد التنفيذ</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{workspace.members_count || 0} عضو</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleManageMembers}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">إدارة الأعضاء</span>
            </Button>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>{workspace.created_at ? new Date(workspace.created_at).toLocaleDateString('ar-SA') : ''}</span>
            </div>
          </div>
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
