import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AsanaApiOptions {
  action: 'getFolder' | 'createFolder' | 'getWorkspace' | 'getFolderProjects' | 'createProject' | 'createTask' | 'updateTask';
  folderId?: string;
  workspaceId?: string;
  folderName?: string;
  projectName?: string;
  projectNotes?: string;
  taskName?: string;
  taskNotes?: string;
  taskStatus?: string;
  projectId?: string;
  taskId?: string;
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
        toast.error('حدث خطأ في الاتصال مع Asana');
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
    // الوظائف الحالية
    getWorkspace: () => callAsanaApi({ action: 'getWorkspace' }),
    getFolder: (folderId: string) => callAsanaApi({ action: 'getFolder', folderId }),
    createFolder: (workspaceId: string, folderName: string) => 
      callAsanaApi({ action: 'createFolder', workspaceId, folderName }),
    getFolderProjects: (folderId: string) => 
      callAsanaApi({ action: 'getFolderProjects', folderId }),
      
    // وظائف جديدة للتزامن
    createProject: (folderId: string, projectName: string, projectNotes?: string) =>
      callAsanaApi({ action: 'createProject', folderId, projectName, projectNotes }),
    createTask: (projectId: string, taskName: string, taskNotes?: string) =>
      callAsanaApi({ action: 'createTask', projectId, taskName, taskNotes }),
    updateTask: (taskId: string, taskStatus: string) =>
      callAsanaApi({ action: 'updateTask', taskId, taskStatus })
  };
};