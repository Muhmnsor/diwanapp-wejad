import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceOverview } from "./components/WorkspaceOverview";
import { WorkspaceTasksList } from "./components/WorkspaceTasksList";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
}

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();

        if (error) {
          console.error("Error fetching workspace:", error);
          setError(true);
          toast.error("Failed to load workspace details.");
          return;
        }

        if (data) {
          setWorkspace(data);
        } else {
          setError(true);
          toast.error("Workspace not found.");
        }
      } catch (error) {
        console.error("Error:", error);
        setError(true);
        toast.error("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Error loading workspace
          </h2>
          <p className="text-gray-500">
            Please check the workspace ID or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <WorkspaceOverview workspace={workspace} />
      <WorkspaceTasksList 
        workspaceId={workspaceId || ""} 
      />
    </div>
  );
};

export default WorkspaceDetails;
