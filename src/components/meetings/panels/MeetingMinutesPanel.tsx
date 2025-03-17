
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeetingMinutes } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface MeetingMinutesPanelProps {
  meetingId: string;
}

export const MeetingMinutesPanel = ({ meetingId }: MeetingMinutesPanelProps) => {
  const { data: minutes, isLoading } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select(`
          *,
          creator:created_by (
            display_name,
            email
          )
        `)
        .eq('meeting_id', meetingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MeetingMinutes;
    },
    enabled: !!meetingId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل محضر الاجتماع...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 border-green-200">منشور</Badge>;
      case 'draft':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">مسودة</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>محضر الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        {!minutes ? (
          <div className="text-center p-8 border rounded-md">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا يوجد محضر لهذا الاجتماع</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  تم إنشاؤه بواسطة: {minutes.creator?.display_name || minutes.creator?.email || 'مستخدم غير معروف'}
                </p>
                <p className="text-sm text-muted-foreground">
                  تاريخ الإنشاء: {new Date(minutes.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div>
                {getStatusBadge(minutes.status)}
              </div>
            </div>
            
            <div className="border rounded-md p-4 mt-4">
              <div className="prose prose-sm max-w-none">
                {minutes.content ? (
                  <div dangerouslySetInnerHTML={{ __html: minutes.content }} />
                ) : (
                  <p className="text-muted-foreground">لا يوجد محتوى حالياً</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
