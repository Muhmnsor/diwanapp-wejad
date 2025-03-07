
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMembersCount = (workspaceId: string, dialogOpen: boolean) => {
  const [membersCount, setMembersCount] = useState(0);

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const { count, error } = await supabase
          .from('workspace_members')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId);

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
  }, [workspaceId, dialogOpen]);

  return membersCount;
};
