
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequestApproveDialogProps {
  requestId: string;
  stepId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestApproveDialog = ({ requestId, stepId, isOpen, onOpenChange }: RequestApproveDialogProps) => {
  const [comments, setComments] = useState("");
  const [selfApproval, setSelfApproval] = useState(false);
  const queryClient = useQueryClient();
  
  // Collect browser metadata for logging
  const collectMetadata = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      timestamp: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };
  
  // Check if this is a self-approval situation
  useEffect(() => {
    if (isOpen && requestId) {
      // Fetch the request to check if requester is the same as current user
      supabase
        .from('requests')
        .select('requester_id')
        .eq('id', requestId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error checking requester:", error);
            return;
          }
          
          // Get current user
          supabase.auth.getUser().then(({ data: userData, error: userError }) => {
            if (userError) {
              console.error("Error getting current user:", userError);
              return;
            }
            
            const isSelfApproval = data.requester_id === userData.user?.id;
            setSelfApproval(isSelfApproval);
            
            // Log for debugging
            if (isSelfApproval) {
              console.log("Self-approval detected: user is approving their own request");
            }
          });
        });
    }
  }, [isOpen, requestId]);
  
  // Log view action when dialog opens
  useEffect(() => {
    if (isOpen && requestId) {
      try {
        supabase.rpc('log_request_view', {
          p_request_id: requestId,
          p_metadata: collectMetadata()
        }).then(({ error }) => {
          if (error) {
            console.error("Error logging request view:", error);
          }
        });
      } catch (error) {
        console.error("Failed to log request view:", error);
      }
    }
  }, [isOpen, requestId]);
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن الموافقة على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      console.log(`Approving request: ${requestId}, step: ${stepId}, comments: "${comments}"`);
      
      // Collect metadata for detailed logging
      const metadata = collectMetadata();
      
      // Use the RPC function to handle approval in a single transaction with logging
      const { data, error } = await supabase.rpc(
        'approve_request', 
        { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments || null,
          p_metadata: metadata
        }
      );
        
      if (error) {
        console.error("Error approving request:", error);
        throw error;
      }
      
      console.log("Approval result:", data);
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      // Handle different messages based on step type
      const message = result.step_type === 'opinion' 
        ? "تم تسجيل رأيك بنجاح" 
        : "تمت الموافقة على الطلب بنجاح";
      
      toast.success(message);
      onOpenChange(false);
      setComments("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
      
      // Show performance info in debug mode
      if (process.env.NODE_ENV === 'development' && result.execution_time_ms) {
        console.log(`Request approval completed in ${result.execution_time_ms}ms`);
      }
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error(`حدث خطأ أثناء الموافقة على الطلب: ${error.message}`);
    }
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>الموافقة على الطلب</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في الموافقة على هذا الطلب؟
          </DialogDescription>
        </DialogHeader>
        
        {selfApproval && (
          <Alert variant="warning" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              تنبيه: أنت تقوم بالموافقة على طلب قمت بإنشائه. هذا مسموح به في حالات الآراء فقط.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            التعليقات (اختياري)
          </label>
          <Textarea
            id="comments"
            placeholder="أضف تعليقًا..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {approveMutation.isPending ? "جاري المعالجة..." : "موافقة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
