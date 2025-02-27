
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { AssigneeForm } from "./AssigneeForm";
import { AssigneeList } from "./AssigneeList";
import { AssigneeItem, DecisionFormProps } from "./types";

export const DecisionForm = ({ 
  ideaId,
  initialStatus,
  initialReason,
  initialTimeline,
  initialBudget,
  assignees: initialAssignees,
  isEditing,
  onSave,
  onCancel
}: DecisionFormProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState(initialReason);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [budget, setBudget] = useState(initialBudget);
  const [assignees, setAssignees] = useState<AssigneeItem[]>(initialAssignees);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAssignee = (name: string, responsibility: string) => {
    const newAssignee: AssigneeItem = {
      id: crypto.randomUUID(),
      name,
      responsibility
    };
    
    setAssignees([...assignees, newAssignee]);
  };
  
  const handleRemoveAssignee = (id: string) => {
    setAssignees(assignees.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
      await onSave(status, reason, timeline, budget, assignees);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="decision-status">حالة القرار</Label>
        <Select 
          value={status} 
          onValueChange={setStatus}
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
      
      {status === 'approved' && (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المكلفون بالتنفيذ</Label>
              
              <AssigneeList 
                assignees={assignees} 
                onRemove={handleRemoveAssignee} 
              />
              
              <AssigneeForm onAdd={handleAddAssignee} />
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
          </div>
        </>
      )}
      
      <div className="flex justify-between">
        {isEditing && (
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            إلغاء
          </Button>
        )}
        <Button 
          className={isEditing ? "ml-3" : "w-full"} 
          onClick={handleSubmit} 
          disabled={isSubmitting || !reason}
        >
          {isSubmitting ? "جاري الحفظ..." : isEditing ? "تحديث القرار" : "حفظ القرار"}
        </Button>
      </div>
    </div>
  );
};
