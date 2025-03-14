
import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, InfoIcon, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

interface RequestRejectDialogProps {
  requestId: string;
  stepId?: string;
  stepType?: string;
  requesterId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestRejectDialog = ({ 
  requestId, 
  stepId, 
  stepType = "decision", 
  requesterId,
  isOpen, 
  onOpenChange 
}: RequestRejectDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const isOpinion = stepType === 'opinion';
  
  // Check if this is a self-rejection (user is rejecting their own request)
  const isSelfRejection = user?.id === requesterId;
  
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error(isOpinion 
          ? "لا يمكن إبداء الرأي على هذا الطلب لأنه لا يوجد خطوة حالية"
          : "لا يمكن رفض هذا الطلب لأنه لا يوجد خطوة حالية"
        );
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error(isOpinion ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      }
      
      // Self-rejection warning for non-opinion steps
      if (isSelfRejection && !isOpinion) {
        throw new Error("لا يمكن رفض طلبك الخاص إلا في حالة خطوات الرأي فقط");
      }
      
      console.log(`${isOpinion ? "Submitting negative opinion" : "Rejecting request"}: ${requestId}, step: ${stepId}, type: ${stepType}, comments: "${comments}"`);

      // Add more metadata to help with debugging
      const metadata = {
        isSelfRejection,
        stepType,
        userId: user?.id,
        userRole: user?.role,
        userIsAdmin: user?.isAdmin,
        clientInfo: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };

      // Use the RPC function that handles everything in a single transaction
      const { data, error } = await supabase
        .rpc('reject_request', { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments.trim(),
          p_metadata: metadata
        });
        
      if (error) {
        console.error(`Error ${isOpinion ? "submitting opinion" : "rejecting request"}:`, error);
        throw error;
      }
      
      console.log(`${isOpinion ? "Opinion" : "Rejection"} result:`, data);
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      // Show appropriate success message based on step type
      const successMessage = isOpinion
        ? "تم تسجيل رأيك السلبي بنجاح" 
        : "تم رفض الطلب بنجاح";
      
      toast.success(successMessage);
      onOpenChange(false);
      setComments("");
      
      // Invalidate all relevant queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
      
      // For opinion steps, make sure the request is immediately removed from the incoming list
      if (isOpinion) {
        // Force refetch rather than just invalidate
        queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      }
    },
    onError: (error) => {
      console.error(`Error ${isOpinion ? "submitting opinion" : "rejecting request"}:`, error);
      toast.error(`حدث خطأ: ${error.message}`);
    }
  });

  const handleReject = () => {
    if (!comments.trim()) {
      toast.error(isOpinion ? "يجب إدخال رأيك" : "يجب إدخال سبب الرفض");
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOpinion ? 'إبداء الرأي على الطلب' : 'رفض الطلب'}
          </DialogTitle>
          <DialogDescription>
            {isOpinion 
              ? 'الرجاء إبداء رأيك حول هذا الطلب' 
              : 'يرجى توضيح سبب رفض هذا الطلب'}
          </DialogDescription>
        </DialogHeader>
        
        {isSelfRejection && !isOpinion && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              لا يمكن رفض طلبك الخاص إلا في حالة خطوات الرأي فقط.
            </AlertDescription>
          </Alert>
        )}
        
        {isOpinion && (
          <Alert variant="default" className="my-2 bg-blue-50 text-blue-700 border-blue-200">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>معلومة</AlertTitle>
            <AlertDescription>
              هذه خطوة لإبداء الرأي فقط ولن تؤثر على سير الطلب.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2 text-destructive">
            {isOpinion ? 'رأيك (مطلوب) *' : 'سبب الرفض (مطلوب) *'}
          </label>
          <Textarea
            id="comments"
            placeholder={isOpinion ? 'اكتب رأيك هنا...' : 'اكتب سبب الرفض هنا...'}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={!comments.trim() ? "border-destructive" : ""}
            required
          />
          {!comments.trim() && (
            <p className="text-sm text-destructive mt-1">
              {isOpinion ? 'يجب إدخال رأيك' : 'يجب إدخال سبب الرفض'}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={rejectMutation.isPending || !comments.trim() || (isSelfRejection && !isOpinion)}
            className={isOpinion ? "bg-blue-600 hover:bg-blue-700" : ""}
            variant={isOpinion ? "default" : "destructive"}
          >
            {rejectMutation.isPending 
              ? "جاري المعالجة..." 
              : isOpinion 
                ? 'إرسال رأي سلبي' 
                : 'رفض الطلب'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
