
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreateRequestParams {
  request_type_id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  form_data: Record<string, any>;
}

export function useCreateRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createRequest = async (params: CreateRequestParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First, get the default workflow for this request type
      const { data: requestType, error: requestTypeError } = await supabase
        .from('request_types')
        .select('default_workflow_id')
        .eq('id', params.request_type_id)
        .single();
        
      if (requestTypeError) {
        throw requestTypeError;
      }
      
      // Create the request
      const { data, error: requestError } = await supabase
        .from('requests')
        .insert({
          request_type_id: params.request_type_id,
          title: params.title,
          priority: params.priority,
          form_data: params.form_data,
          requester_id: user.id,
          workflow_id: requestType.default_workflow_id,
          status: 'pending'
        })
        .select()
        .single();
        
      if (requestError) {
        throw requestError;
      }
      
      return data;
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { createRequest, isLoading, error };
}
