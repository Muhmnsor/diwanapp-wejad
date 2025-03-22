
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Edit } from "lucide-react";
import { MeetingMinutesItem } from "@/hooks/meetings/useMeetingMinutesItems";
import { useUpdateMeetingMinutesItem } from "@/hooks/meetings/useUpdateMeetingMinutesItem";
import { toast } from "sonner";

interface MeetingMinutesItemEditorProps {
  minutesItem: MeetingMinutesItem;
}

export const MeetingMinutesItemEditor: React.FC<MeetingMinutesItemEditorProps> = ({ 
  minutesItem 
}) => {
  const [content, setContent] = useState<string>(minutesItem.content || "");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const updateMinutesItemMutation = useUpdateMeetingMinutesItem();

  // Update local state when minutesItem changes
  useEffect(() => {
    setContent(minutesItem.content || "");
  }, [minutesItem]);

  const handleSave = async () => {
    try {
      await updateMinutesItemMutation.mutateAsync({
        id: minutesItem.id,
        content
      });
      setIsEditing(false);
      toast.success("تم حفظ محضر البند بنجاح");
    } catch (error) {
      console.error("Error saving minutes item:", error);
      toast.error("حدث خطأ أثناء حفظ محضر البند");
    }
  };

  return (
    <div className="mt-2">
      {isEditing ? (
        <div className="space-y-2 print:hidden">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب محضر هذا البند هنا..."
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMinutesItemMutation.isPending}
              size="sm"
            >
              <Save className="h-4 w-4 ml-1" />
              حفظ
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setContent(minutesItem.content || "");
              }}
              variant="outline"
              size="sm"
            >
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 rounded-md p-4 min-h-[100px] whitespace-pre-wrap">
            {content ? (
              <div className="leading-relaxed">{content}</div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                لا يوجد محضر لهذا البند. انقر على "تعديل" لإضافة محضر.
              </div>
            )}
          </div>
          <div className="flex justify-end mt-2 print:hidden">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 ml-1" />
              تعديل
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
