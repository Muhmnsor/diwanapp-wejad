
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApproveRequestParams {
  requestId: string;
  stepId: string;
  comments?: string;
}

interface RejectRequestParams {
  requestId: string;
  stepId: string;
  comments: string;
}

export const useRequestApproval = () => {
  const queryClient = useQueryClient();

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: ApproveRequestParams) => {
      const { data, error } = await supabase.rpc('approve_request_step', {
        p_request_id: requestId,
        p_step_id: stepId,
        p_comments: comments || null
      });

      if (error) {
        console.error("فشل في الموافقة على الطلب:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("تمت الموافقة على الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-details"] });
    },
    onError: (error) => {
      toast.error(`فشل في الموافقة على الطلب: ${error.message}`);
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: RejectRequestParams) => {
      const { data, error } = await supabase.rpc('reject_request_step', {
        p_request_id: requestId,
        p_step_id: stepId,
        p_comments: comments
      });

      if (error) {
        console.error("فشل في رفض الطلب:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("تم رفض الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-details"] });
    },
    onError: (error) => {
      toast.error(`فشل في رفض الطلب: ${error.message}`);
    }
  });

  return {
    approveRequest,
    rejectRequest
  };
};
