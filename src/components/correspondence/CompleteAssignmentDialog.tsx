import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";

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
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { completeAssignment } = useCorrespondence();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await completeAssignment(correspondenceId, notes);
      
      if (!result.success) {
        throw new Error("فشل في إكمال المعاملة");
      }
      
      toast({
        title: "تم إكمال المعاملة بنجاح",
        description: `تم إكمال المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (error) {
      console.error("Error completing assignment:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إكمال المعاملة",
        description: String(error) || "حدث خطأ أثناء إكمال المعاملة، يرجى المحاولة مرة أخرى"
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
            <CheckCircle className="h-5 w-5" />
            إكمال المعاملة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="correspondence-number">رقم المعاملة</Label>
            <Input 
              id="correspondence-number" 
              value={correspondenceNumber} 
              disabled 
            />
          </div>
          
          <div>
            <Label htmlFor="notes">ملاحظات الإكمال</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أدخل ملاحظات حول كيفية إكمال المعاملة"
              rows={3}
            />
          </div>
          
          <div className="p-3 bg-green-50 rounded border border-green-100 text-sm text-green-800">
            <div className="flex gap-1 items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p>سيتم تحديث حالة المعاملة إلى "مكتمل" وتسجيل تاريخ الإكمال تلقائيًا</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'جاري الإكمال...' : 'إكمال المعاملة'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

