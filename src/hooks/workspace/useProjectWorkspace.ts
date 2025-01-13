import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProjectWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ['project-workspace', workspaceId],
    queryFn: async () => {
      console.log('Fetching workspace details for ID:', workspaceId);
      
      const { data: workspace, error: workspaceError } = await supabase
        .functions.invoke('get-workspace', {
          body: { workspaceId }
        });

      if (workspaceError) {
        console.error('Error fetching workspace:', workspaceError);
        throw new Error(workspaceError.message || 'حدث خطأ أثناء تحميل بيانات مساحة العمل');
      }

      console.log('Successfully fetched workspace data:', workspace);
      return workspace;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات مساحة العمل'
    }
  });
};