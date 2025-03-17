
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { toast } from "sonner";
import { DecisionStatus } from "@/types/meeting";

interface AddDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

export const AddDecisionDialog = ({ open, onOpenChange, meetingId, onSuccess }: AddDecisionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionText, setDecisionText] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('pending');
  
  const queryClient = useQueryClient();
  const { data: participants = [] } = useMeetingParticipants(meetingId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decisionText.trim()) {
      toast.error('الرجاء إدخال نص القرار');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // الحصول على آخر رقم ترتيب
      const { data: lastDecision, error: fetchError } = await supabase
        .from('meeting_decisions')
        .select('order_number')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: false })
        .limit(1)
        .single();
      
      const nextOrderNumber = lastDecision ? lastDecision.order_number + 1 : 1;
      
      // إضافة القرار الجديد
      const { data, error } = await supabase
        .from('meeting_decisions')
        .insert({
          meeting_id: meetingId,
          decision_text: decisionText,
          responsible_user_id: responsibleUserId || null,
          due_date: dueDate || null,
          status,
          order_number: nextOrderNumber
        })
        .select();
      
      if (error) throw error;
      
      toast.success('تم إضافة القرار بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-decisions', meetingId] });
      onSuccess?.();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding decision:', error);
      toast.error('حدث خطأ أثناء إضافة القرار');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setDecisionText('');
    setResponsibleUserId('');
    setDueDate('');
    setStatus('pending');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة قرار جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="decision_text">نص القرار *</Label>
            <Textarea
              id="decision_text"
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              placeholder="أدخل نص القرار هنا..."
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible_user">المسؤول عن التنفيذ</Label>
              <Select value={responsibleUserId} onValueChange={setResponsibleUserId}>
                <SelectTrigger id="responsible_user">
                  <SelectValue placeholder="اختر المسؤول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">غير محدد</SelectItem>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.user_id}>
                      {participant.user_display_name || participant.user_email || 'مشارك'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">حالة القرار</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DecisionStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جارِ الإضافة...' : 'إضافة القرار'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
