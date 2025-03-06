
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const NotificationTester: React.FC = () => {
  const { createNotification } = useInAppNotifications();
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();

  const sendTestNotification = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإرسال إشعار تجريبي');
      return;
    }

    setIsSending(true);
    try {
      const result = await createNotification({
        title: 'إشعار تجريبي',
        message: 'هذا إشعار تجريبي للتأكد من عمل نظام الإشعارات بشكل صحيح',
        notification_type: 'task',
        user_id: user.id
      });

      if (result) {
        toast.success('تم إرسال الإشعار التجريبي بنجاح');
        console.log('Test notification sent successfully:', result);
      } else {
        toast.error('فشل في إرسال الإشعار التجريبي');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('حدث خطأ أثناء إرسال الإشعار التجريبي');
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اختبار نظام الإشعارات</CardTitle>
        <CardDescription>أرسل إشعارًا تجريبيًا للتأكد من عمل النظام بشكل صحيح</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          سيتم إرسال إشعار تجريبي إلى حسابك الحالي. تحقق من أيقونة الإشعارات في الشريط العلوي.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={sendTestNotification} 
          disabled={isSending}
        >
          {isSending ? 'جاري الإرسال...' : 'إرسال إشعار تجريبي'}
        </Button>
      </CardFooter>
    </Card>
  );
};
