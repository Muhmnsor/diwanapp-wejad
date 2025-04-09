import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { CheckCircle, Loader2 } from "lucide-react";

interface CompleteAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
  correspondenceNumber: string;
}

export const CompleteAssignmentDialog: React.FC<CompleteAssignmentDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refreshCorrespondence } = useCorrespondence();

  const handleComplete = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 1. تحديث حالة المعاملة إلى "مكتمل"
      const { error: updateError } = await supabase
        .from('correspondence')
        .update({ status: 'مكتمل' })
        .eq('id', correspondenceId);
      
      if (updateError) throw updateError;
      
      // 2. إضافة سجل في تاريخ المعاملة
      const { error: historyError } = await supabase
        .from('correspondence_history')
        .insert({
          correspondence_id: correspondenceId,
          action_type: 'إكمال المعاملة',
          action_details: notes || 'تم إكمال المعاملة',
          previous_status: 'قيد المعالجة',
          new_status: 'مكتمل',
          action_by: (await supabase.auth.getUser()).data.user?.id,
          action_date: new Date().toISOString(),
        });
      
      if (historyError) throw historyError;
      
      // 3. إنشاء إشعار للمستخدمين المعنيين
      const { error: notificationError } = await supabase
        .from('in_app_notifications')
        .insert({
          title: `تم إكمال معاملة #${correspondenceNumber}`,
          message: `تم إكمال معاملة #${correspondenceNumber} ${notes ? `- ${notes}` : ''}`,
          related_entity_id: correspondenceId,
          related_entity_type: 'correspondence',
          notification_type: 'completion',
          user_id: (await supabase.auth.getUser()).data.user?.id,
          read: false
        });
      
      if (notificationError) throw notificationError;
      
      toast({
        title: "تم إكمال المعاملة بنجاح",
        description: "تم تحديث حالة المعاملة إلى مكتمل",
        variant: "default",
      });
      
      // تحديث البيانات في الواجهة
      refreshCorrespondence();
      
      onClose();
    } catch (error) {
      console.error("Error completing correspondence:", error);
      toast({
        title: "خطأ في إكمال المعاملة",
        description: "حدث خطأ أثناء محاولة إكمال المعاملة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            إكمال المعاملة
          </DialogTitle>
        </DialogHeader>
          
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="completion-notes">ملاحظات الإكمال (اختياري)</Label>
            <Textarea
              id="completion-notes"
              placeholder="أدخل ملاحظات حول إكمال المعاملة"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
            
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              سيتم تغيير حالة المعاملة إلى "مكتمل" وإضافة هذا الإجراء إلى سجل تاريخ المعاملة.
            </p>
          </div>
        </div>
          
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإكمال...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                إكمال المعاملة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
