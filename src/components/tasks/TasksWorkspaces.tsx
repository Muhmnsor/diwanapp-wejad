
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceCard } from "./WorkspaceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@/types/workspace";
import { useEffect } from "react";
import { toast } from "sonner";

export const TasksWorkspaces = () => {
  const { data: workspaces, isLoading, refetch } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');
      
      if (error) {
        console.error("Error fetching workspaces:", error);
        throw error;
      }
      return data || [];
    }
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

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
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
