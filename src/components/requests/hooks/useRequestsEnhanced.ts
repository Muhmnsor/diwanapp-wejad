
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
      
      if (error) {
        console.error('Error creating request:', error);
        
        // Provide more specific error message for common issues
        if (error.message.includes('permission denied')) {
          throw new Error('ليس لديك صلاحية إنشاء الطلب، يرجى التحقق من دورك في النظام');
        } else if (error.message.includes('violates foreign key constraint')) {
          throw new Error('بيانات الطلب غير صحيحة، يرجى التحقق من ارتباط نوع الطلب والمسار');
        } else {
          throw error;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    }
  });
  
  // Mutation for approving requests
  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments, metadata }: { requestId: string, stepId?: string, comments?: string, metadata?: any }) => {
      console.log(`Approving request: ${requestId}, step: ${stepId}, comments: ${comments}`);
      
      if (!stepId) {
        throw new Error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      // Use the RPC function 
      const { data, error } = await supabase.rpc('approve_request', {
        p_request_id: requestId,
        p_step_id: stepId,
        p_comments: comments || null,
        p_metadata: metadata || {}
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Check if this was an opinion submission
      const isOpinion = data?.step_type === 'opinion';
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      
      // For opinions, immediately remove from the incoming list
      if (isOpinion) {
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      }
      
      // Also invalidate any request details that might be showing
      queryClient.invalidateQueries({ queryKey: ['request-details'] });
    }
  });
  
  // Mutation for rejecting requests
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments, metadata }: { requestId: string, stepId?: string, comments: string, metadata?: any }) => {
      console.log(`Rejecting request: ${requestId}, step: ${stepId}, comments: ${comments}`);
      
      if (!stepId) {
        throw new Error("لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error("يجب إدخال سبب الرفض");
      }
      
      // Use the RPC function
      const { data, error } = await supabase.rpc('reject_request', {
        p_request_id: requestId,
        p_step_id: stepId,
        p_comments: comments,
        p_metadata: metadata || {}
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Check if this was an opinion submission
      const isOpinion = data?.step_type === 'opinion';
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      
      // For opinions, immediately remove from the incoming list
      if (isOpinion) {
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      }
      
      // Also invalidate any request details that might be showing
      queryClient.invalidateQueries({ queryKey: ['request-details'] });
    }
  });
  
  const refreshRequests = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] }),
        queryClient.invalidateQueries({ queryKey: ['requests', 'outgoing'] }),
        queryClient.invalidateQueries({ queryKey: ['request-details'] })
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
