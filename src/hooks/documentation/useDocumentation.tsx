
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDocumentation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocumentation = async (section: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documentation')
        .select('*')
        .eq('section', section)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching documentation:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchDocumentation
  };
};
