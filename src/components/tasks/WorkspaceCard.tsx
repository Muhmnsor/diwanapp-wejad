// src/components/tasks/WorkspaceCard.tsx

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
  Lock
} from "lucide-react";
import { Workspace } from "@/types/workspace";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WorkspaceMembersDialog } from "./WorkspaceMembersDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(true);
  const [projectCounts, setProjectCounts] = useState({
    completed: 0,
    pending: 0,
    stopped: 0,
    stalled: 0,
    total: 0
  });
  const [membersCount, setMembersCount] = useState(workspace.members_count || 0);
  const [isUserMember, setIsUserMember] = useState(false);
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(false); // إضافة حالة جديدة للتحقق من دور المستخدم

  const { user } = useAuthStore();

  // Check user membership or admin status
  useEffect(() => {
    const checkMembership = async () => {
      // Skip membership check if user is admin
      if (user?.isAdmin) {
        setIsUserMember(true);
        return;
      }

      try {
        const { data: membership, error } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user?.id)
          .single();

        if (error) {
          console.error('Error checking membership:', error);
          setIsUserMember(false);
          return;
        }

        setIsUserMember(!!membership);
      } catch (error) {
        console.error('Failed to check membership:', error);
        setIsUserMember(false);
      }
    };

    checkMembership();
  }, [workspace.id, user]);

  // Check if current user is a member
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsUserMember(false);
          setIsCheckingMembership(false);
          return;
        }

        const { data: memberData, error } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', workspace.id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking workspace membership:', error);
          setIsUserMember(false);
        } else {
          setIsUserMember(!!memberData);
        }
      } catch (error) {
        console.error('Failed to check membership:', error);
        setIsUserMember(false);
      } finally {
        setIsCheckingMembership(false);
      }
    };

    checkMembership();
  }, [workspace.id]);

  // Fetch project counts
  useEffect(() => {
    const fetchProjectCounts = async () => {
      try {
        // Fetch all projects for this workspace
        const { data: projects, error } = await supabase
          .from('project_tasks')
          .select('status')
          .eq('workspace_id', workspace.id);

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        const total = projects?.length || 0;
        
        // Consider a project completed if status is 'completed'
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

  // Fetch members count
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
  }, [workspace.id, isMembersDialogOpen]); // Re-fetch when dialog closes

  // Check user role in workspace
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        setIsWorkspaceAdmin(data.role === 'admin');
      }
    };
    
    checkUserRole();
  }, [workspace.id, user?.id]);

  const handleClick = () => {
    if ( !(user?.isAdmin || isUserMember)) {
      toast({
        title: "غير مصرح",
        description: "عذراً، يجب أن تكون عضواً في مساحة العمل للوصول إليها",
        variant: "destructive",
      });
      return;
    }
    navigate(`/tasks/workspace/${workspace.id}`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMembersDialogOpen(true);
  };

  const onMembersDialogClose = (open: boolean) => {
    setIsMembersDialogOpen(open);
  };

  if (isCheckingMembership) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={`relative hover:shadow-md transition-shadow ${
                isUserMember ? 'cursor-pointer' : 'cursor-not-allowed opacity-75' 
              }`}
              onClick={handleClick}
            >
        {!isUserMember && (
          <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        )}
              
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
                {(user?.isAdmin || isWorkspaceAdmin) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={handleManageMembers}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">إدارة الأعضاء</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TooltipTrigger>
          
          {/* Show tooltip if user can't access */}
          {!(user?.isAdmin || isUserMember) && (
            <TooltipContent>
              <p>يجب أن تكون عضوًا في المساحة للوصول</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <WorkspaceMembersDialog 
        open={isMembersDialogOpen}
        onOpenChange={onMembersDialogClose}
        workspaceId={workspace.id}
      />
    </>
  );
};
