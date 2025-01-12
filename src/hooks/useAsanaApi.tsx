import { supabase } from "@/integrations/supabase/client";

interface AsanaApiOptions {
  action: 'getFolder' | 'createFolder' | 'getFolderProjects';
  folderId?: string;
  workspaceId?: string;
  folderName?: string;
}

export const useAsanaApi = () => {
  const callAsanaApi = async (options: AsanaApiOptions) => {
    console.log('📡 بدء طلب Asana API:', options);
    
    try {
      const { data, error } = await supabase.functions.invoke('asana-api', {
        body: options
      });

      if (error) {
        console.error('❌ خطأ في استدعاء Asana API:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ لم يتم استلام بيانات من Asana API');
        throw new Error('فشل الاتصال مع Asana');
      }

      console.log('✅ استجابة Asana API:', data);
      return data;
    } catch (error) {
      console.error('❌ خطأ في useAsanaApi:', error);
      throw error;
    }
  };

  return {
    getFolder: (folderId: string) => callAsanaApi({ action: 'getFolder', folderId }),
    createFolder: (workspaceId: string, folderName: string) => 
      callAsanaApi({ action: 'createFolder', workspaceId, folderName }),
    getFolderProjects: (folderId: string) => 
      callAsanaApi({ action: 'getFolderProjects', folderId })
  };
};