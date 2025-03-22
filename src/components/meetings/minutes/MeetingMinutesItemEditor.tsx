
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { MeetingMinutesItem } from "@/hooks/meetings/useMeetingMinutesItems";
import { useUpdateMeetingMinutesItem } from "@/hooks/meetings/useUpdateMeetingMinutesItem";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingMinutesItemEditorProps {
  minutesItem: MeetingMinutesItem;
}

export const MeetingMinutesItemEditor: React.FC<MeetingMinutesItemEditorProps> = ({ 
  minutesItem 
}) => {
  const [content, setContent] = useState(minutesItem.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const updateMutation = useUpdateMeetingMinutesItem(minutesItem.meeting_id);
  
  useEffect(() => {
    setContent(minutesItem.content || '');
    setHasChanges(false);
  }, [minutesItem.content]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: minutesItem.id,
        content: content
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save minutes item:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-2">
      {updateMutation.isPending && !isSaving ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <Textarea
          value={content}
          onChange={handleChange}
          className="min-h-[100px] text-right"
          placeholder="أدخل التفاصيل والمناقشات حول هذا البند..."
          dir="rtl"
        />
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          size="sm" 
          variant={hasChanges ? "default" : "outline"}
          disabled={!hasChanges || isSaving}
        >
          <Save className="h-4 w-4 ml-2" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </div>
  );
};
