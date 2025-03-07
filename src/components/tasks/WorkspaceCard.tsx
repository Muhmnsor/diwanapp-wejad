
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2,
  Clock,
  Users,
  UserPlus,
  AlertTriangle,
  ClipboardList,
  PauseCircle,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import { Workspace } from "@/types/workspace";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WorkspaceMembersDialog } from "./WorkspaceMembersDialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { EditWorkspaceDialog } from "./EditWorkspaceDialog";
import { DeleteWorkspaceDialog } from "./DeleteWorkspaceDialog";
import { useAuthStore } from "@/store/refactored-auth";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const navigate = useNavigate();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectCounts, setProjectCounts] = useState({
    completed: 0,
    pending: 0,
    stopped: 0,
    stalled: 0,
    total: 0
  });
  const [membersCount, setMembersCount] = useState(workspace.members_count || 0);
  const [canEdit, setCanEdit] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setCanEdit(false);
        return;
      }

      try {
        const isCreator = workspace.created_by === user.id;
        const isAdmin = user.isAdmin;
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();
        
        const isWorkspaceAdmin = memberData?.role === 'admin';
        
        setCanEdit(isCreator || isAdmin || isWorkspaceAdmin);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanEdit(false);
      }
    };
    
    checkPermissions();
  }, [workspace.id, workspace.created_by, user]);

  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('project_tasks')
          .select('status')
          .eq('workspace_id', workspace.id);

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        const total = projects?.length || 0;
        
        const completed = projects?.filter(p => p.status === 'completed').length || 0;
        
        const pending = projects?.filter(p => 
          p.status === 'in_progress' || p.status === 'pending'
        ).length || 0;
        
        const stopped = projects?.filter(p => p.status === 'stopped' || p.status === 'on_hold').length || 0;
        const stalled = total - completed - pending - stopped;

        console.log('Project counts calculation:', {
          total,
          completed,
          pending,
          stopped,
          stalled,
          projects
        });

        setProjectCounts({
          completed,
          pending,
          stopped,
          stalled,
          total
        });
      } catch (error) {
        console.error('Failed to fetch project counts:', error);
      }
    };

    fetchProjectCounts();
  }, [workspace.id]);

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const { count, error } = await supabase
          .from('workspace_members')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id);

        if (error) {
          console.error('Error fetching members count:', error);
          return;
        }

        setMembersCount(count || 0);
      } catch (error) {
        console.error('Failed to fetch members count:', error);
      }
    };

    fetchMembersCount();
  }, [workspace.id, isMembersDialogOpen]);

  const handleClick = () => {
    navigate(`/tasks/workspace/${workspace.id}`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMembersDialogOpen(true);
  };

  const onMembersDialogClose = (open: boolean) => {
    setIsMembersDialogOpen(open);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <div className="mb-3 flex justify-between items-start">
            <h3 className="font-bold text-lg">{workspace.name}</h3>
            
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="h-4 w-4 ml-2" />
                    <span>تعديل</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    <span>حذف</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="text-gray-500 mb-4 text-sm line-clamp-2">
            {workspace.description || 'لا يوجد وصف'}
          </p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{projectCounts.completed} مكتملة</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{projectCounts.pending} جارية</span>
              </div>
              <div className="flex items-center gap-1">
                <PauseCircle className="h-4 w-4 text-orange-500" />
                <span>{projectCounts.stopped} متوقفة</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>{projectCounts.stalled} متعثرة</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{membersCount} عضو</span>
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
        onOpenChange={onMembersDialogClose}
        workspaceId={workspace.id}
      />

      <EditWorkspaceDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        workspace={workspace}
      />

      <DeleteWorkspaceDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        workspaceId={workspace.id}
        workspaceName={workspace.name}
      />
    </>
  );
};
