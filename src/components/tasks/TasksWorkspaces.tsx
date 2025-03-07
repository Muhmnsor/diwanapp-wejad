
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceCard } from "./WorkspaceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@/types/workspace";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/refactored-auth";

export const TasksWorkspaces = () => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  const { data: workspaces, isLoading, refetch, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      try {
        setError(null);
        
        if (!user) {
          console.log("No authenticated user, fetching only public workspaces");
          const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('status', 'active');
            
          if (error) {
            console.error("Error fetching workspaces:", error);
            setError(error.message || "حدث خطأ أثناء جلب مساحات العمل");
            throw error;
          }
          
          return data || [];
        }
        
        console.log("Fetching workspaces for user:", user.id);
        
        // Get workspaces created by the user
        const { data: createdWorkspaces, error: createdError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('created_by', user.id);
          
        if (createdError) {
          console.error("Error fetching created workspaces:", createdError);
          setError(createdError.message || "حدث خطأ أثناء جلب مساحات العمل");
          throw createdError;
        }
        
        // Get workspaces where user is a member
        const { data: memberWorkspaces, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id);
          
        if (memberError) {
          console.error("Error fetching workspace memberships:", memberError);
          // Don't throw here, we can still return created workspaces
        }
        
        // If user is a member of any workspaces, fetch those workspaces
        let memberWorkspaceData: Workspace[] = [];
        if (memberWorkspaces && memberWorkspaces.length > 0) {
          const workspaceIds = memberWorkspaces.map(m => m.workspace_id);
          
          const { data: memberWorkspaceDetails, error: detailsError } = await supabase
            .from('workspaces')
            .select('*')
            .in('id', workspaceIds);
            
          if (detailsError) {
            console.error("Error fetching member workspace details:", detailsError);
          } else {
            memberWorkspaceData = memberWorkspaceDetails || [];
          }
        }
        
        // If user is an admin, fetch all workspaces
        let allWorkspacesData: Workspace[] = [];
        const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (isAdmin) {
          console.log("User is admin, fetching all workspaces");
          const { data: allWorkspaces, error: allError } = await supabase
            .from('workspaces')
            .select('*');
            
          if (allError) {
            console.error("Error fetching all workspaces for admin:", allError);
          } else {
            allWorkspacesData = allWorkspaces || [];
            // If admin has all workspaces, just return those
            return allWorkspacesData;
          }
        }
        
        // Combine and deduplicate results
        const combinedWorkspaces = [...(createdWorkspaces || []), ...memberWorkspaceData];
        const uniqueWorkspaces = Array.from(
          new Map(combinedWorkspaces.map(w => [w.id, w])).values()
        );
        
        return uniqueWorkspaces;
      } catch (err) {
        console.error("Error in workspaces query:", err);
        setError(err instanceof Error ? err.message : "حدث خطأ غير معروف");
        throw err;
      }
    },
    enabled: true
  });

  // Set up realtime subscription to workspace changes
  useEffect(() => {
    const channel = supabase
      .channel('public:workspaces')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'workspaces'
        }, 
        () => {
          console.log("Workspace change detected, refetching workspaces");
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Listen for hash changes to refetch when needed
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#workspaces') {
        console.log("Workspaces hash detected, refetching");
        refetch();
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check in case we're already on the hash
    if (window.location.hash === '#workspaces') {
      refetch();
    }
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [refetch]);

  const handleRefresh = () => {
    setError(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (isError || error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="flex-1">{error || "حدث خطأ أثناء جلب مساحات العمل"}</AlertDescription>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="mr-2">
          <RefreshCw className="h-4 w-4 mr-2" /> إعادة المحاولة
        </Button>
      </Alert>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-500">لا توجد مساحات عمل</h3>
        <p className="text-sm text-gray-400 mt-2">قم بإنشاء مساحة عمل جديدة للبدء في إدارة المهام</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace: Workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
};
