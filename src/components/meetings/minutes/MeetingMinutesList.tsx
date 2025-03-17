
import { useState } from "react";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface MeetingMinutesListProps {
  meetingId?: string;
}

export const MeetingMinutesList = ({ meetingId }: MeetingMinutesListProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  
  const { 
    data: minutes, 
    isLoading, 
    error,
    refetch 
  } = useMeetingMinutes(meetingId);
  
  // Toggle edit mode and set initial content
  const handleEditClick = () => {
    setEditContent(minutes?.content || "");
    setIsEditing(true);
  };
  
  // Save the edited content (to be implemented)
  const handleSaveClick = async () => {
    // Implementation will be added in the future
    setIsEditing(false);
  };
  
  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
  };
  
  // Create new minutes if none exist (to be implemented)
  const handleCreateClick = () => {
    // Implementation will be added in the future
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل محضر الاجتماع...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل محضر الاجتماع: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If no minutes exist yet
  if (!minutes) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">محضر الاجتماع</h2>
          <Button onClick={handleCreateClick}>
            <FileText className="mr-2 h-4 w-4" />
            إنشاء محضر
          </Button>
        </div>
        
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لم يتم إنشاء محضر لهذا الاجتماع بعد</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            إنشاء محضر جديد
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">محضر الاجتماع</h2>
          <Badge 
            variant={minutes.status === 'published' ? 'default' : 'outline'}
          >
            {minutes.status === 'draft' ? 'مسودة' : 
             minutes.status === 'published' ? 'منشور' : 'مؤرشف'}
          </Badge>
        </div>
        
        {!isEditing && (
          <Button onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            تعديل المحضر
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">محتوى المحضر</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelClick}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveClick}>
                  حفظ
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {minutes.content ? (
                <div className="whitespace-pre-wrap">{minutes.content}</div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  لا يوجد محتوى لهذا المحضر
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
