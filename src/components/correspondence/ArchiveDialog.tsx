import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Archive, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { Checkbox } from "@/components/ui/checkbox";

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
  correspondenceNumber: string;
}

export const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [archiveNumber, setArchiveNumber] = useState<string>("");
  const [archiveDate, setArchiveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [archiveNotes, setArchiveNotes] = useState<string>("");
  const [includeAttachments, setIncludeAttachments] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { archiveCorrespondence } = useCorrespondence();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await archiveCorrespondence(correspondenceId, {
        archive_number: archiveNumber,
        archive_date: archiveDate,
        archive_notes: archiveNotes,
        include_attachments_in_archive: includeAttachments
      });
      
      if (!result.success) {
        throw new Error(result.error || "فشل في أرشفة المعاملة");
      }
      
      toast({
        title: "تم أرشفة المعاملة بنجاح",
        description: `تم أرشفة المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (error) {
      console.error("Error archiving correspondence:", error);
      toast({
        variant: "destructive",
        title: "خطأ في أرشفة المعاملة",
        description: String(error) || "حدث خطأ أثناء أرشفة المعاملة، يرجى المحاولة مرة أخرى"
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
            <Archive className="h-5 w-5" />
            أرشفة المعاملة
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
            <Label htmlFor="archive-number" className="required">رقم الأرشفة</Label>
            <Input 
              id="archive-number" 
              value={archiveNumber}
              onChange={e => setArchiveNumber(e.target.value)}
              placeholder="أدخل رقم الأرشفة"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="archive-date" className="required">تاريخ الأرشفة</Label>
            <Input 
              id="archive-date" 
              type="date"
              value={archiveDate}
              onChange={e => setArchiveDate(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="archive-notes">ملاحظات الأرشفة</Label>
            <Textarea 
              id="archive-notes" 
              value={archiveNotes}
              onChange={e => setArchiveNotes(e.target.value)}
              placeholder="أدخل ملاحظات حول أرشفة المعاملة"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="include-attachments" 
              checked={includeAttachments}
              onCheckedChange={(checked) => setIncludeAttachments(!!checked)}
            />
            <Label htmlFor="include-attachments">
              تضمين المرفقات في الأرشفة
            </Label>
          </div>
          
          <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
            <div className="flex gap-1 items-center">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <p>سيتم تحديث حالة المعاملة إلى "مؤرشفة" وتسجيل بيانات الأرشفة</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'جاري الأرشفة...' : 'أرشفة المعاملة'}
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

