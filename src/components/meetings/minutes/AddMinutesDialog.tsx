
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddMinutesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

export const AddMinutesDialog: React.FC<AddMinutesDialogProps> = ({ 
  open, 
  onOpenChange, 
  meetingId, 
  onSuccess 
}) => {
  const [content, setContent] = useState("");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const createMinutesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .insert({
          meeting_id: meetingId,
          content: content,
          attendees: attendees
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم إضافة محضر الاجتماع بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', meetingId] });
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error adding meeting minutes:", error);
      toast.error("حدث خطأ أثناء إضافة محضر الاجتماع");
    }
  });
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setAttendees([...attendees, attendeeInput.trim()]);
      setAttendeeInput("");
    }
  };
  
  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("الرجاء إدخال محتوى المحضر");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createMinutesMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setContent("");
    setAttendees([]);
    setAttendeeInput("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة محضر الاجتماع</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="content">محتوى المحضر *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="أدخل محتوى محضر الاجتماع هنا..."
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attendees">الحضور</Label>
            <div className="flex gap-2">
              <Input
                id="attendees"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="أدخل اسم الحاضر"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddAttendee}
                disabled={!attendeeInput.trim()}
              >
                إضافة
              </Button>
            </div>
            
            {attendees.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                      <span>{attendee}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(index)}
                        className="text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جارِ الإضافة...' : 'إضافة المحضر'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
