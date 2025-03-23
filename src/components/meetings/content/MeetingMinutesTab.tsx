
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MeetingMinutesTabProps {
  meetingId: string;
}

interface MinuteItem {
  id: string;
  meeting_id: string;
  content: string;
  created_at: string;
  created_by?: string;
  order_number: number;
}

export const MeetingMinutesTab = ({ meetingId }: MeetingMinutesTabProps) => {
  const [newMinute, setNewMinute] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // استرجاع محضر الاجتماع
  const { data: minutes, isLoading, error, refetch } = useQuery({
    queryKey: ['meeting-minutes', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_number', { ascending: true });
        
      if (error) throw error;
      
      return data as MinuteItem[];
    },
    enabled: !!meetingId,
  });

  // إضافة عنصر جديد إلى المحضر
  const handleAddMinute = async () => {
    if (!newMinute.trim()) {
      toast.error('يرجى كتابة محتوى المحضر');
      return;
    }

    try {
      const newOrderNumber = minutes && minutes.length > 0 
        ? Math.max(...minutes.map(item => item.order_number)) + 1 
        : 1;

      const { error } = await supabase
        .from('meeting_minutes')
        .insert({
          meeting_id: meetingId,
          content: newMinute,
          order_number: newOrderNumber
        });

      if (error) throw error;

      toast.success('تمت إضافة عنصر جديد إلى المحضر');
      setNewMinute('');
      setIsAddingNew(false);
      refetch();
    } catch (error) {
      console.error('Error adding minute:', error);
      toast.error('حدث خطأ أثناء إضافة عنصر إلى المحضر');
    }
  };

  // تحديث عنصر في المحضر
  const handleUpdateMinute = async (id: string) => {
    if (!editContent.trim()) {
      toast.error('لا يمكن حفظ محتوى فارغ');
      return;
    }

    try {
      const { error } = await supabase
        .from('meeting_minutes')
        .update({ content: editContent })
        .eq('id', id);

      if (error) throw error;

      toast.success('تم تحديث المحضر بنجاح');
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Error updating minute:', error);
      toast.error('حدث خطأ أثناء تحديث المحضر');
    }
  };

  // حذف عنصر من المحضر
  const handleDeleteMinute = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meeting_minutes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف العنصر من المحضر');
      refetch();
    } catch (error) {
      console.error('Error deleting minute:', error);
      toast.error('حدث خطأ أثناء حذف العنصر من المحضر');
    }
  };

  // تجهيز العنصر للتعديل
  const startEditing = (item: MinuteItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  // إلغاء التعديل
  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
    setNewMinute('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">جاري تحميل محضر الاجتماع...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading meeting minutes:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل محضر الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>محضر الاجتماع</CardTitle>
        {!isAddingNew && (
          <Button onClick={startAddingNew} size="sm">
            <Plus className="ml-2 h-4 w-4" />
            إضافة
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAddingNew ? (
          <div className="mb-6 space-y-4 border rounded-md p-4">
            <Textarea
              placeholder="اكتب محتوى المحضر هنا..."
              value={newMinute}
              onChange={(e) => setNewMinute(e.target.value)}
              rows={4}
              className="w-full resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={cancelAddingNew} variant="outline" size="sm">
                إلغاء
              </Button>
              <Button onClick={handleAddMinute} size="sm">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </div>
        ) : null}

        {(!minutes || minutes.length === 0) && !isAddingNew ? (
          <p className="text-gray-500">لا توجد عناصر في محضر الاجتماع. قم بإضافة عناصر جديدة باستخدام زر الإضافة.</p>
        ) : (
          <div className="space-y-4">
            {minutes?.map((item) => (
              <div key={item.id} className="border rounded-md p-4">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button onClick={cancelEditing} variant="outline" size="sm">
                        إلغاء
                      </Button>
                      <Button onClick={() => handleUpdateMinute(item.id)} size="sm">
                        <Save className="ml-2 h-4 w-4" />
                        حفظ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <p className="whitespace-pre-wrap">{item.content}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditing(item)}
                        variant="ghost"
                        size="icon"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteMinute(item.id)}
                        variant="ghost"
                        size="icon"
                        title="حذف"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
