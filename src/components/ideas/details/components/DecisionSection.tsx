
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";

interface DecisionSectionProps {
  ideaId: string;
  status: string;
  isAdmin?: boolean; 
  onStatusChange?: () => void;
  decision?: {
    id?: string;
    status: string;
    reason: string;
    assignee?: string;
    timeline?: string;
    budget?: string;
    created_at?: string;
    created_by?: string;
    created_by_name?: string;
  };
}

export const DecisionSection = ({ 
  ideaId, 
  status, 
  isAdmin = false, 
  onStatusChange,
  decision 
}: DecisionSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(decision?.status || "pending_decision");
  const [reason, setReason] = useState<string>(decision?.reason || "");
  const [assignee, setAssignee] = useState<string>(decision?.assignee || "");
  const [timeline, setTimeline] = useState<string>(decision?.timeline || "");
  const [budget, setBudget] = useState<string>(decision?.budget || "");
  
  // إضافة سجلات للتشخيص
  console.log("DecisionSection props:", { ideaId, status, isAdmin, decision });
  
  const handleSubmitDecision = async () => {
    if (!reason) {
      toast.error("يجب إدخال سبب القرار");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // تحديث حالة الفكرة
      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);
        
      if (ideaError) throw ideaError;
      
      // إضافة قرار جديد أو تحديث القرار الحالي
      const decisionData = {
        idea_id: ideaId,
        status: newStatus,
        reason,
        assignee: assignee || null,
        timeline: timeline || null,
        budget: budget || null,
      };
      
      let dbError;
      
      if (decision?.id) {
        // تحديث القرار الحالي
        const { error } = await supabase
          .from("idea_decisions")
          .update(decisionData)
          .eq("id", decision.id);
          
        dbError = error;
      } else {
        // إضافة قرار جديد
        const { error } = await supabase
          .from("idea_decisions")
          .insert([decisionData]);
          
        dbError = error;
      }
      
      if (dbError) throw dbError;
      
      toast.success("تم حفظ القرار بنجاح");
      if (onStatusChange) onStatusChange();
      
    } catch (error) {
      console.error("Error saving decision:", error);
      toast.error("حدث خطأ أثناء حفظ القرار");
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض واجهة اتخاذ القرار دائماً بغض النظر عن حالة الفكرة
  // للاختبار فقط - نحذف جميع شروط التحقق من الحالة
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">اتخاذ القرار</CardTitle>
        <CardDescription>
          {decision ? "تعديل القرار الحالي" : "اتخذ قرارًا بشأن هذه الفكرة"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision-status">حالة القرار</Label>
            <Select 
              value={newStatus} 
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالة القرار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">موافقة</SelectItem>
                <SelectItem value="rejected">رفض</SelectItem>
                <SelectItem value="needs_modification">تحتاج تعديل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">سبب القرار / ملاحظات</Label>
            <Textarea 
              id="reason" 
              placeholder="أدخل سبب القرار أو أي ملاحظات"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          {newStatus === 'approved' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignee">المكلف بالتنفيذ</Label>
                <Input 
                  id="assignee" 
                  placeholder="أدخل اسم الشخص أو الإدارة المكلفة بالتنفيذ"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">الإطار الزمني المقترح</Label>
                <Input 
                  id="timeline" 
                  placeholder="مثال: 3 أشهر، أسبوعين، ..."
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية المقترحة</Label>
                <Input 
                  id="budget" 
                  placeholder="الميزانية المقترحة للتنفيذ (إن وجدت)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </>
          )}
          
          <Button 
            className="w-full" 
            onClick={handleSubmitDecision} 
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? "جاري الحفظ..." : decision ? "تحديث القرار" : "حفظ القرار"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
