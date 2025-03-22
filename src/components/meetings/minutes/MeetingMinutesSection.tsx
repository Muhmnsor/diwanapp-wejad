
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { useUpdateMeetingMinutes } from "@/hooks/meetings/useUpdateMeetingMinutes";
import { toast } from "sonner";

interface MeetingMinutesSectionProps {
  meetingId: string;
}

export const MeetingMinutesSection: React.FC<MeetingMinutesSectionProps> = ({ meetingId }) => {
  const { data: minutes, isLoading, error } = useMeetingMinutes(meetingId);
  const updateMinutesMutation = useUpdateMeetingMinutes();
  
  const [content, setContent] = useState<string>(minutes?.content || "");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Update local state when data is loaded
  React.useEffect(() => {
    if (minutes?.content && !isEditing) {
      setContent(minutes.content);
    }
  }, [minutes, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateMinutesMutation.mutateAsync({
        meetingId,
        content
      });
      setIsEditing(false);
      toast.success("تم حفظ محضر الاجتماع بنجاح");
    } catch (error) {
      console.error("Error saving meeting minutes:", error);
      toast.error("حدث خطأ أثناء حفظ محضر الاجتماع");
    }
  };

  const handleCancel = () => {
    setContent(minutes?.content || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">جاري تحميل محضر الاجتماع...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">حدث خطأ أثناء تحميل محضر الاجتماع</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>محضر الاجتماع</CardTitle>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" size="sm">تعديل</Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="default" size="sm" disabled={updateMinutesMutation.isPending}>
              <Save className="h-4 w-4 ml-1" />
              حفظ
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">إلغاء</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="أدخل محضر الاجتماع هنا..."
            className="min-h-[400px] resize-none p-4 leading-relaxed"
          />
        ) : (
          <div className="min-h-[400px] bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
            {content ? (
              <div className="leading-relaxed">{content}</div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                لا يوجد محضر لهذا الاجتماع. انقر على "تعديل" لإضافة محضر الاجتماع.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
