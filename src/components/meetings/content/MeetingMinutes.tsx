
import React, { useState, useEffect } from "react";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { useUpdateMeetingMinutes } from "@/hooks/meetings/useUpdateMeetingMinutes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

interface MeetingMinutesProps {
  meetingId: string;
}

export const MeetingMinutes: React.FC<MeetingMinutesProps> = ({ meetingId }) => {
  const { data: minutes, isLoading, error } = useMeetingMinutes(meetingId);
  const { mutate: updateMinutes, isPending: isSaving } = useUpdateMeetingMinutes();
  
  const [content, setContent] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  useEffect(() => {
    if (minutes?.content) {
      setContent(minutes.content);
      setUnsavedChanges(false);
    }
  }, [minutes]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setUnsavedChanges(true);
  };
  
  const handleSave = () => {
    updateMinutes({ meetingId, content }, {
      onSuccess: () => {
        setUnsavedChanges(false);
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل محضر الاجتماع...</span>
      </div>
    );
  }
  
  if (error && !(error as any).code === 'PGRST116') { // Skip "no rows" error
    return (
      <div className="text-red-500 p-4">
        حدث خطأ أثناء تحميل محضر الاجتماع: {error.message}
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>محضر الاجتماع</CardTitle>
        <Button 
          onClick={handleSave} 
          disabled={!unsavedChanges || isSaving}
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ المحضر
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="اكتب محضر الاجتماع هنا..."
          className="min-h-[300px] font-sans"
        />
        
        {unsavedChanges && (
          <p className="text-amber-600 text-sm mt-2">
            * لديك تغييرات غير محفوظة
          </p>
        )}
      </CardContent>
    </Card>
  );
};
