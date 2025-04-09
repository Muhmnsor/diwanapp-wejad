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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Archive } from "lucide-react";

interface ArchiveCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
  correspondenceNumber: string;
}

export const ArchiveCorrespondenceDialog: React.FC<ArchiveCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [archiveNumber, setArchiveNumber] = useState<string>("");
  const [archiveDate, setArchiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [archiveNotes, setArchiveNotes] = useState<string>("");
  const [includeAttachments, setIncludeAttachments] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!archiveNumber) {
      toast({
        variant: "destructive",
        title: "خطأ في الأرشفة",
        description: "يرجى إدخال رقم الأرشفة"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Update correspondence status to "archived"
      const { error } = await supabase
        .from('correspondence')
        .update({
          status: 'مؤرشف',
          archived_at: new Date().toISOString(),
          archive_number: archiveNumber,
          archive_date: archiveDate,
          archive_notes: archiveNotes,
          include_attachments_in_archive: includeAttachments
        })
        .eq('id', correspondenceId);
        
      if (error) throw error;
      
      toast({
        title: "تمت الأرشفة بنجاح",
        description: `تم أرشفة المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (err) {
      console.error("Error archiving correspondence:", err);
      toast({
        variant: "destructive",
        title: "خطأ في الأرشفة",
        description: "حدث خطأ أثناء أرشفة المعاملة، يرجى المحاولة مرة أخرى"
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
            <Label htmlFor="archive-number">رقم الأرشفة</Label>
            <Input 
              id="archive-number" 
              value={archiveNumber}
              onChange={e => setArchiveNumber(e.target.value)}
              placeholder="أدخل رقم الأرشفة"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="archive-date">تاريخ الأرشفة</Label>
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
              placeholder="أدخل أي ملاحظات خاصة بالأرشفة"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="include-attachments" 
              checked={includeAttachments}
              onCheckedChange={checked => setIncludeAttachments(checked === true)}
            />
            <Label htmlFor="include-attachments">
              تضمين المرفقات في الأرشفة
            </Label>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit" disabled={loading}>
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

