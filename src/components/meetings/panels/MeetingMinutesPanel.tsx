
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingMinutes } from "@/components/meetings/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Edit, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingMinutesPanelProps {
  minutes: MeetingMinutes | null;
  onEdit?: () => void;
}

export const MeetingMinutesPanel: React.FC<MeetingMinutesPanelProps> = ({ 
  minutes,
  onEdit 
}) => {
  if (!minutes) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="ml-2 h-5 w-5 text-primary" />
            محضر الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لم يتم إنشاء محضر للاجتماع بعد
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <FileText className="ml-2 h-5 w-5 text-primary" />
            محضر الاجتماع
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={minutes.status === 'published' ? 'default' : 'outline'}>
              {minutes.status === 'published' ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> منشور
                </span>
              ) : 'مسودة'}
            </Badge>
            {onEdit && (
              <button 
                onClick={onEdit}
                className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 rounded-full bg-muted hover:bg-muted/80"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">تعديل المحضر</span>
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="prose prose-sm max-w-none rtl">
            {minutes.content ? (
              <div dangerouslySetInnerHTML={{ __html: minutes.content }} />
            ) : (
              <p className="text-muted-foreground text-center">
                المحضر لا يحتوي على محتوى
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
