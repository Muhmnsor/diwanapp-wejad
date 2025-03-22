
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, FileText, Edit } from 'lucide-react';

interface MeetingMinutesProps {
  meetingId: string;
}

export const MeetingMinutes: React.FC<MeetingMinutesProps> = ({ meetingId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      console.log('Fetching meeting minutes for meeting:', meetingId);
      
      if (!meetingId) {
        console.error('No meeting ID provided to fetch minutes');
        throw new Error('Meeting ID is required');
      }
      
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        console.error('Error fetching meeting minutes:', error);
        throw error;
      }
      
      if (data) {
        setContent(data.content || '');
        console.log('Fetched meeting minutes:', data);
        return data;
      }
      
      return null;
    },
    enabled: !!meetingId,
  });

  const handleSave = async () => {
    if (!meetingId) return;
    
    setIsSaving(true);
    try {
      if (data) {
        // Update existing minutes
        const { error } = await supabase
          .from('meeting_minutes')
          .update({ 
            content,
            updated_at: new Date().toISOString() 
          })
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        // Create new minutes
        const { error } = await supabase
          .from('meeting_minutes')
          .insert([{ 
            meeting_id: meetingId,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
      }
      
      toast.success('تم حفظ محضر الاجتماع بنجاح');
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error saving meeting minutes:', error);
      toast.error('حدث خطأ أثناء حفظ محضر الاجتماع');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching meeting minutes:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل محضر الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          محضر الاجتماع
        </CardTitle>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 ml-2" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            className="min-h-[200px] font-normal"
            placeholder="أدخل محضر الاجتماع هنا..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : content ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            لم يتم إضافة محضر لهذا الاجتماع بعد. انقر على "تعديل" لإضافة محضر.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
