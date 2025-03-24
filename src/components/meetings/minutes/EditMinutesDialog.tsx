
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";

interface EditMinutesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  minutes: MeetingMinutes;
  onSuccess?: () => void;
}

export const EditMinutesDialog: React.FC<EditMinutesDialogProps> = ({ 
  open, 
  onOpenChange, 
  meetingId, 
  minutes,
  onSuccess 
}) => {
  const [content, setContent] = useState(minutes?.content || "");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>(minutes?.attendees || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (open && minutes) {
      setContent(minutes.content || "");
      setAttendees(minutes.attendees || []);
    }
  }, [open, minutes]);
  
  const updateMinutesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .update({
          content: content,
          attendees: attendees,
          updated_at: new Date().toISOString()
        })
        .eq('id', minutes.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث محضر الاجتماع بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', meetingId] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating meeting minutes:", error);
      toast.error("حدث خطأ أثناء تحديث محضر الاجتماع");
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
      await updateMinutesMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل محضر الاجتماع</DialogTitle>
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
              {isSubmitting ? 'جارِ التحديث...' : 'تحديث المحضر'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
