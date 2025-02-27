
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

  // للاختبار: عرض واجهة اتخاذ القرار للجميع، بغض النظر عن كون المستخدم مشرفًا أم لا
  // تمت إزالة شرط isAdmin مؤقتًا
  if (status === 'pending_decision' || decision || 
      status === 'approved' || status === 'rejected' || status === 'needs_modification') {
    
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
  }
  
  // عرض معلومات القرار الحالي إذا كان موجوداً
  if (decision) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">القرار النهائي</CardTitle>
            <CardDescription>
              {decision.created_at && `تم اتخاذ القرار بتاريخ ${formatDate(decision.created_at)}`}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(decision.status)}`}>
            {getStatusDisplay(decision.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1 flex items-center">
                {decision.status === 'approved' ? (
                  <CheckCircle className="ml-1 h-4 w-4 text-green-600" />
                ) : decision.status === 'rejected' ? (
                  <XCircle className="ml-1 h-4 w-4 text-red-600" />
                ) : (
                  <Clock className="ml-1 h-4 w-4 text-orange-600" />
                )}
                {decision.status === 'approved' ? 'سبب الموافقة' : decision.status === 'rejected' ? 'سبب الرفض' : 'ملاحظات للتعديل'}
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{decision.reason}</p>
            </div>
            
            {decision.status === 'approved' && (
              <>
                <Separator />
                
                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold">تفاصيل التنفيذ</h4>
                  
                  {decision.assignee && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">المكلف بالتنفيذ:</div>
                      <div className="col-span-2">{decision.assignee}</div>
                    </div>
                  )}
                  
                  {decision.timeline && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">الإطار الزمني:</div>
                      <div className="col-span-2">{decision.timeline}</div>
                    </div>
                  )}
                  
                  {decision.budget && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-gray-600">الميزانية المقترحة:</div>
                      <div className="col-span-2">{decision.budget}</div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {decision.created_by_name && (
              <div className="text-sm text-gray-500 mt-4">
                تم اتخاذ القرار بواسطة: {decision.created_by_name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // للفكرة التي في حالة بانتظار القرار (للعرض للمستخدمين العاديين)
  if (status === 'pending_decision') {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">القرار</CardTitle>
          <CardDescription>
            انتهت فترة المناقشة. الفكرة بانتظار القرار النهائي.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-3 text-amber-600">
            <Clock className="ml-2 h-5 w-5" />
            بانتظار القرار النهائي
          </div>
        </CardContent>
      </Card>
    );
  }

  // للفكرة قيد المراجعة أو في حالة المسودة (للعرض)
  if (status === 'draft' || status === 'under_review') {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">القرار</CardTitle>
          <CardDescription>
            الفكرة قيد المناقشة. سيتم اتخاذ القرار بعد انتهاء فترة المناقشة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-3 text-muted-foreground">
            <Clock className="ml-2 h-5 w-5" />
            بانتظار انتهاء المناقشة
          </div>
        </CardContent>
      </Card>
    );
  }

  // حالة افتراضية (عندما لا تتطابق أي من الحالات السابقة)
  return null;
};
