
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const NotificationTester = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('system');
  const [count, setCount] = useState(1);
  const navigate = useNavigate();

  const handleCreateTestNotifications = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-notification', {
        body: {
          userId: user.id,
          type: notificationType,
          count: Number(count)
        }
      });

      if (error) throw error;

      toast.success(`تم إنشاء ${data.count} إشعار تجريبي بنجاح`);
      
      // Navigate to the notifications page to see the results
      navigate('/notifications');
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعارات التجريبية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">أداة إنشاء إشعارات تجريبية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع الإشعار</label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الإشعار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="event">فعالية</SelectItem>
                <SelectItem value="task">مهمة</SelectItem>
                <SelectItem value="project">مشروع</SelectItem>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="comment">تعليق</SelectItem>
                <SelectItem value="system">نظام</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">عدد الإشعارات</label>
            <Input 
              type="number" 
              min="1" 
              max="10"
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              disabled={notificationType === 'all'}
            />
            {notificationType === 'all' && (
              <p className="text-xs text-muted-foreground">
                سيتم إنشاء إشعار واحد لكل نوع
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateTestNotifications} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء إشعارات تجريبية'}
        </Button>
      </CardFooter>
    </Card>
  );
};
