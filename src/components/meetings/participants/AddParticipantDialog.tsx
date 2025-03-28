
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAddMeetingParticipant } from '@/hooks/meetings/useAddMeetingParticipant';
import { AttendanceStatus, ParticipantRole } from '@/types/meeting';
import { supabase } from '@/integrations/supabase/client';
import { useParticipantRoles } from '@/hooks/meetings/useParticipantRoles';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';

export interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
  onSubmit?: (participantData: {
    user_email: string;
    user_display_name: string;
    role: ParticipantRole;
    title?: string;
    phone?: string;
  }) => void;
  isPending?: boolean;
}

export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess,
  onSubmit,
  isPending: externalIsPending,
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<ParticipantRole>('member');
  const { mutate: addParticipant, isPending: internalIsPending } = useAddMeetingParticipant();
  const { availableRoles } = useParticipantRoles(meetingId);
  const { getRoleLabel } = useMeetingRoles();
  
  const isPending = externalIsPending !== undefined ? externalIsPending : internalIsPending;

  // إعادة تعيين اختيار الدور إذا كان الدور الحالي غير متاح
  useEffect(() => {
    if (open && availableRoles.length > 0 && !availableRoles.includes(role)) {
      setRole(availableRoles[0]);
    }
  }, [open, availableRoles, role]);

  // إعادة تعيين النموذج عند فتح الحوار
  useEffect(() => {
    if (open) {
      setEmail('');
      setDisplayName('');
      setTitle('');
      setPhone('');
      setRole('member');
    }
  }, [open]);

  // وظيفة التحقق من صحة رقم الجوال
  const validatePhone = (value: string): boolean => {
    // تأكد من أن الهاتف يبدأ بـ 05 وله 10 أرقام في المجموع
    return /^05\d{8}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !displayName || !role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من صحة رقم الجوال
    if (phone && !validatePhone(phone)) {
      toast.error('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      return;
    }
    
    // إذا تم توفير معالج إرسال خارجي، استخدمه
    if (onSubmit) {
      onSubmit({
        user_email: email,
        user_display_name: displayName,
        role,
        title,
        phone
      });
      return;
    }
    
    try {
      // الحصول على المستخدم الحالي لتعيينه كمنشئ
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id;
      
      // إضافة المشارك باستخدام الهوك
      addParticipant({
        meetingId,
        participant: {
          user_email: email,
          user_display_name: displayName,
          role: role,
          attendance_status: 'pending' as AttendanceStatus,
          title,
          phone,
          // إذا كان هذا المشارك مستخدم مسجل بهذا البريد الإلكتروني، فيجب علينا مثاليًا
          // البحث عن معرفه. في الوقت الحالي، نستخدم معرف UUID سيتم إنشاؤه في الهوك.
        }
      }, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          onOpenChange(false);
          
          // إعادة تعيين النموذج
          setEmail('');
          setDisplayName('');
          setTitle('');
          setPhone('');
          setRole('member');
          
          toast.success('تمت إضافة المشارك بنجاح');
        },
        onError: (error) => {
          console.error('Error adding participant:', error);
          toast.error('حدث خطأ أثناء إضافة المشارك');
        }
      });
      
    } catch (error) {
      console.error('Exception adding participant:', error);
      toast.error('حدث خطأ غير متوقع');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مشارك جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">الاسم</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اسم المشارك"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">الصفة</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="المسمى الوظيفي أو الصفة"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => {
                // التأكد من إدخال الأرقام فقط وتبدأ بـ 05
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setPhone(value);
                }
              }}
              placeholder="05xxxxxxxx"
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">يجب أن يبدأ بـ 05 ويتكون من 10 أرقام</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select value={role} onValueChange={(value) => setRole(value as ParticipantRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((availableRole) => (
                  <SelectItem key={availableRole} value={availableRole}>
                    {getRoleLabel(availableRole)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'جاري الإضافة...' : 'إضافة المشارك'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
