
import { supabase } from "@/integrations/supabase/client";

/**
 * Enable real-time updates for tasks in a specific project
 * @param projectId The ID of the project to subscribe to task updates for
 * @param callbacks Callback functions for different real-time events
 * @returns A cleanup function to unsubscribe from the real-time channel
 */
export const enableTasksRealtime = (
  projectId: string,
  callbacks: {
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
    onInsert?: (payload: any) => void;
  }
) => {
  console.log("Setting up real-time task updates for project:", projectId);
  
  const channel = supabase
    .channel(`project-tasks-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        console.log("Task update received:", payload);
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        console.log("Task deletion received:", payload);
        if (callbacks.onDelete) {
          callbacks.onDelete(payload);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        console.log("New task received:", payload);
        if (callbacks.onInsert) {
          callbacks.onInsert(payload);
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });
  
  // Return cleanup function
  return () => {
    console.log("Removing real-time task updates subscription");
    supabase.removeChannel(channel);
  };
};

/**
 * Check if real-time is enabled for the tasks table
 * @returns Promise that resolves to true if real-time is enabled
 */
export const checkRealtimeEnabled = async () => {
  try {
    // This query checks if the tasks table is in the supabase_realtime publication
    const { data, error } = await supabase.rpc('check_table_realtime_enabled', {
      table_name: 'tasks'
    });
    
    if (error) {
      console.error("Error checking real-time status:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Error checking real-time status:", error);
    return false;
  }
};
