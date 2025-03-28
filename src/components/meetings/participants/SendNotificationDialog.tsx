
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationTemplateSelect } from '@/components/notifications/shared/NotificationTemplateSelect';
import { useMeeting } from '@/hooks/meetings/useMeeting';
import { AlertCircle, Bell, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: any;
  onSendNotification: (templateId: string, variables: Record<string, string>) => void;
  isSending: boolean;
  meetingId: string;
}

export const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({
  open,
  onOpenChange,
  participant,
  onSendNotification,
  isSending,
  meetingId
}) => {
  const [templateId, setTemplateId] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('template');
  const { data: meeting } = useMeeting(meetingId);

  // Determine available notification channels
  const hasWhatsApp = !!participant?.phone;
  const hasSystemAccount = !!participant?.user_id;

  // Prepare notification variables based on the meeting and participant data
  const getNotificationVariables = () => {
    const variables: Record<string, string> = {
      اسم_المشارك: participant.user_display_name || '',
      عنوان_الإجتماع: meeting?.title || '',
      تاريخ_الإجتماع: meeting?.date || '',
      وقت_الإجتماع: meeting?.start_time || '',
      مكان_الإجتماع: meeting?.location || meeting?.meeting_link || '',
      message: message // For custom messages
    };
    
    return variables;
  };

  const handleSend = () => {
    if (activeTab === 'template' && !templateId) {
      return;
    }
    
    if (activeTab === 'custom' && !message) {
      return;
    }
    
    // For custom messages, we'll use a generic template ID and pass the message as a variable
    const effectiveTemplateId = activeTab === 'template' ? templateId : 'custom_message_template';
    
    onSendNotification(effectiveTemplateId, getNotificationVariables());
  };

  // When the participant changes, reset the form
  useEffect(() => {
    setTemplateId('');
    setMessage('');
  }, [participant]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إرسال تذكير للمشارك</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            إرسال تذكير لـ: <span className="font-medium text-foreground">{participant?.user_display_name}</span>
          </p>
          
          <div className="bg-muted/30 p-3 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">قنوات الإشعارات المتاحة:</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className={`text-sm ${hasWhatsApp ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  واتساب {hasWhatsApp ? '' : '(رقم هاتف غير متوفر)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className={`text-sm ${hasSystemAccount ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  إشعار داخلي {hasSystemAccount ? '' : '(ليس مستخدم نظام)'}
                </span>
              </div>
            </div>
          </div>
          
          {!hasWhatsApp && !hasSystemAccount && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا يمكن إرسال إشعارات لهذا المشارك لأنه لا يملك رقم هاتف أو حساب في النظام.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="template" onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="template">استخدام قالب</TabsTrigger>
              <TabsTrigger value="custom">رسالة مخصصة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template">اختر قالب الرسالة</Label>
                  <NotificationTemplateSelect
                    notificationType="reminder"
                    targetType="event"
                    value={templateId}
                    onValueChange={setTemplateId}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">نص الرسالة</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="أدخل نص الرسالة هنا..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSend}
            disabled={
              isSending || 
              (activeTab === 'template' && !templateId) || 
              (activeTab === 'custom' && !message) ||
              (!hasWhatsApp && !hasSystemAccount)
            }
          >
            {isSending ? 'جاري الإرسال...' : 'إرسال'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
