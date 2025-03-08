
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select('id, name, description, created_at')
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setWorkspaces(data || []);
    } catch (err: any) {
      console.error('Error fetching workspaces:', err);
      setError(err.message || 'حدث خطأ أثناء جلب مساحات العمل');
      toast.error('فشل في تحميل مساحات العمل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces,
    isLoading,
    error,
    refreshWorkspaces: fetchWorkspaces
  };
};
