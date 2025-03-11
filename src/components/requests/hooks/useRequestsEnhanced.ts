
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateNewRequest } from '../utils/workflowValidator';

export const useRequestsEnhanced = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Query for incoming requests (where user is an approver)
  const incomingRequestsQuery = useQuery({
    queryKey: ['requests', 'incoming'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_incoming_requests', {
        p_user_id: (await supabase.auth.getSession()).data.session?.user.id
      });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Query for outgoing requests (created by the user)
  const outgoingRequestsQuery = useQuery({
    queryKey: ['requests', 'outgoing'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_outgoing_requests', {
        p_user_id: (await supabase.auth.getSession()).data.session?.user.id
      });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Mutation for creating requests with enhanced validation
  const createRequest = useMutation({
    mutationFn: async (formData: any) => {
      console.log('Creating request with data:', formData);
      
      // First validate the request data
      const validationResult = await validateNewRequest(formData);
      if (!validationResult.valid) {
        console.error('Request validation failed:', validationResult.error);
        throw new Error(`فشل في إنشاء الطلب: ${validationResult.error}`);
      }
      
      // Use the validated and potentially modified request data
      const validatedData = validationResult.requestData;
      
      // Make sure requester_id is set
      if (!validatedData.requester_id) {
        validatedData.requester_id = (await supabase.auth.getSession()).data.session?.user.id;
      }
      
      // Create the request using the RPC function to bypass RLS
      const { data, error } = await supabase.rpc('insert_request_bypass_rls', {
        request_data: validatedData
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
  
  // Mutation for approving requests
  const approveRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments?: string }) => {
      const { data, error } = await supabase
        .from('request_approvals')
        .insert({
          request_id: requestId,
          approver_id: (await supabase.auth.getSession()).data.session?.user.id,
          status: 'approved',
          comments: comments || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
  
  // Mutation for rejecting requests
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments: string }) => {
      const { data, error } = await supabase
        .from('request_approvals')
        .insert({
          request_id: requestId,
          approver_id: (await supabase.auth.getSession()).data.session?.user.id,
          status: 'rejected',
          comments: comments
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
  
  const refreshRequests = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] }),
        queryClient.invalidateQueries({ queryKey: ['requests', 'outgoing'] })
      ]);
    } catch (error) {
      console.error('Error refreshing requests:', error);
      toast.error('حدث خطأ أثناء تحديث الطلبات');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return {
    incomingRequests: incomingRequestsQuery.data,
    outgoingRequests: outgoingRequestsQuery.data,
    incomingLoading: incomingRequestsQuery.isLoading,
    outgoingLoading: outgoingRequestsQuery.isLoading,
    incomingError: incomingRequestsQuery.error,
    outgoingError: outgoingRequestsQuery.error,
    refreshRequests,
    isRefreshing,
    createRequest,
    approveRequest,
    rejectRequest
  };
};
