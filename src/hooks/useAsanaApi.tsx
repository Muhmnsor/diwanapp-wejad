import { supabase } from "@/integrations/supabase/client";

interface AsanaApiOptions {
  action: 'getFolder' | 'createFolder' | 'getWorkspace' | 'getFolderProjects';
  folderId?: string;
  workspaceId?: string;
  folderName?: string;
}

export const useAsanaApi = () => {
  const callAsanaApi = async (options: AsanaApiOptions) => {
    console.log('Calling Asana API with options:', options);
    
    try {
      const { data, error } = await supabase.functions.invoke('asana-api', {
        body: options
      });

      if (error) {
        console.error('Error calling Asana API:', error);
        throw error;
      }

      console.log('Asana API response:', data);
      return data;
    } catch (error) {
      console.error('Error in useAsanaApi:', error);
      throw error;
    }
  };

  return {
    getWorkspace: () => callAsanaApi({ action: 'getWorkspace' }),
    getFolder: (folderId: string) => callAsanaApi({ action: 'getFolder', folderId }),
    createFolder: (workspaceId: string, folderName: string) => 
      callAsanaApi({ action: 'createFolder', workspaceId, folderName }),
    getFolderProjects: (folderId: string) => 
      callAsanaApi({ action: 'getFolderProjects', folderId })
  };
};