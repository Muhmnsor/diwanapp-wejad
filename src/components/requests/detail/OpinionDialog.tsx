
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
import { InfoIcon, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

interface OpinionDialogProps {
  requestId: string;
  stepId?: string;
  requesterId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpinionDialog = ({ 
  requestId, 
  stepId,
  requesterId,
  isOpen, 
  onOpenChange 
}: OpinionDialogProps) => {
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const opinionMutation = useMutation({
    mutationFn: async () => {
      if (!stepId) {
        throw new Error("لا يمكن إبداء الرأي على هذا الطلب لأنه لا يوجد خطوة حالية");
      }
      
      if (!comments || comments.trim() === '') {
        throw new Error("يجب إدخال رأيك");
      }
      
      console.log(`Submitting opinion: ${requestId}, step: ${stepId}, comments: "${comments}"`);
      
      // Add metadata to help with debugging
      const metadata = {
        userId: user?.id,
        userRole: user?.role,
        userIsAdmin: user?.isAdmin,
        clientInfo: {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent
        }
      };
      
      // Use the approve_request RPC function but with opinion metadata
      const { data, error } = await supabase
        .rpc('approve_request', { 
          p_request_id: requestId,
          p_step_id: stepId,
          p_comments: comments.trim(),
          p_metadata: metadata
        });
        
      if (error) {
        console.error("Error submitting opinion:", error);
        throw error;
      }
      
      console.log("Opinion submission result:", data);
      return data;
    },
    onSuccess: (result) => {
      if (result && !result.success) {
        toast.warning(result.message);
        onOpenChange(false);
        return;
      }
      
      toast.success("تم تسجيل رأيك بنجاح");
      onOpenChange(false);
      setComments("");
      
      // Invalidate all relevant queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['request-details', requestId] });
      
      // Make sure the request is immediately removed from the incoming list
      queryClient.invalidateQueries({ queryKey: ['requests', 'incoming'] });
    },
    onError: (error) => {
      console.error("Error submitting opinion:", error);
      toast.error(`حدث خطأ أثناء إبداء الرأي: ${error.message}`);
    }
  });

  const handleSubmitOpinion = () => {
    if (!comments.trim()) {
      toast.error("يجب إدخال رأيك");
      return;
    }
    opinionMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            إبداء الرأي على الطلب
          </DialogTitle>
          <DialogDescription>
            الرجاء إبداء رأيك حول هذا الطلب
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="default" className="my-2 bg-blue-50 text-blue-700 border-blue-200">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>معلومة</AlertTitle>
          <AlertDescription>
            هذه خطوة لإبداء الرأي فقط ولن تؤثر على سير الطلب.
          </AlertDescription>
        </Alert>
        
        <div className="py-4">
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            رأيك (مطلوب) *
          </label>
          <Textarea
            id="comments"
            placeholder="اكتب رأيك هنا..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={!comments.trim() ? "border-blue-300 focus:border-blue-500" : ""}
            required
          />
          {!comments.trim() && (
            <p className="text-sm text-blue-600 mt-1">
              يجب إدخال رأيك
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmitOpinion} 
            disabled={opinionMutation.isPending || !comments.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {opinionMutation.isPending ? "جاري المعالجة..." : 'إبداء الرأي'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
