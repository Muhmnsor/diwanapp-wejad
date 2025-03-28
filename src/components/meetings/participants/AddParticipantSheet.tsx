import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneField } from '@/components/events/form/fields/PhoneField';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';
import { Loader2, User, Users } from 'lucide-react';
import { UserSelector } from './UserSelector';
interface AddParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    user_id?: string;
    user_email: string;
    user_display_name: string;
    role: string;
    title?: string;
    phone?: string;
    is_system_user?: boolean;
  }) => void;
  isPending: boolean;
}
export const AddParticipantSheet: React.FC<AddParticipantSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isPending
}) => {
  const [participantType, setParticipantType] = useState<'external' | 'system'>('external');
  const [formData, setFormData] = useState({
    user_id: '',
    user_email: '',
    user_display_name: '',
    role: '',
    title: '',
    phone: ''
  });
  const {
    getRoleOptions
  } = useMeetingRoles();
  const roleOptions = getRoleOptions();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      is_system_user: participantType === 'system'
    });
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSystemUserSelect = (userId: string, userData?: {
    email?: string;
    display_name?: string;
  }) => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        user_id: userId,
        user_email: userData.email || '',
        user_display_name: userData.display_name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        user_id: userId
      }));
    }
  };

  // إعادة تعيين النموذج عندما يتم إغلاق النافذة
  React.useEffect(() => {
    if (!open) {
      setFormData({
        user_id: '',
        user_email: '',
        user_display_name: '',
        role: '',
        title: '',
        phone: ''
      });
      setParticipantType('external');
    }
  }, [open]);
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" dir="rtl">
        <SheetHeader>
          <SheetTitle>إضافة مشارك جديد</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex items-center justify-between mb-4 border rounded-md">
            <Button type="button" variant={participantType === 'external' ? 'default' : 'ghost'} className="flex-1 rounded-none rounded-r-md" onClick={() => setParticipantType('external')}>
              <User className="h-4 w-4 ml-2" />
              مشارك خارجي
            </Button>
            <Button type="button" variant={participantType === 'system' ? 'default' : 'ghost'} className="flex-1 rounded-none rounded-l-md" onClick={() => setParticipantType('system')}>
              <Users className="h-4 w-4 ml-2" />
              مستخدم النظام
            </Button>
          </div>

          {participantType === 'system' ? <div className="space-y-2">
              <Label htmlFor="system_user">مستخدم النظام</Label>
              <UserSelector value={formData.user_id} onChange={(userId, userData) => handleSystemUserSelect(userId, userData)} />

              {formData.user_display_name && <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                  <p><strong>الاسم:</strong> {formData.user_display_name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {formData.user_email}</p>
                </div>}
            </div> : <>
              <div className="space-y-2">
                <Label htmlFor="user_display_name">الاسم</Label>
                <Input id="user_display_name" value={formData.user_display_name} onChange={e => handleChange('user_display_name', e.target.value)} placeholder="اسم المشارك" required={participantType === 'external'} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_email">البريد الإلكتروني</Label>
                <Input id="user_email" type="email" value={formData.user_email} onChange={e => handleChange('user_email', e.target.value)} placeholder="example@domain.com" required={participantType === 'external'} />
              </div>
            </>}

          <div className="space-y-2">
            <Label htmlFor="title">الصفة</Label>
            <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="الصفة الوظيفية" />
          </div>
          
          <div className="space-y-2">
            
            <PhoneField value={formData.phone} onChange={value => handleChange('phone', value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور في الاجتماع</Label>
            <Select value={formData.role} onValueChange={value => handleChange('role', value)} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(option => <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </> : 'إضافة'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>;
};