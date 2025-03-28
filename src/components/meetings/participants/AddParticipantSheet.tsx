
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneField } from '@/components/events/form/fields/PhoneField';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';
import { Loader2 } from 'lucide-react';

interface AddParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    user_email: string;
    user_display_name: string;
    role: string;
    title?: string;
    phone?: string;
  }) => void;
  isPending: boolean;
}

export const AddParticipantSheet: React.FC<AddParticipantSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isPending
}) => {
  const [formData, setFormData] = React.useState({
    user_email: '',
    user_display_name: '',
    role: '',
    title: '',
    phone: ''
  });
  const { getRoleOptions } = useMeetingRoles();
  const roleOptions = getRoleOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // إعادة تعيين النموذج عندما يتم إغلاق النافذة
  React.useEffect(() => {
    if (!open) {
      setFormData({
        user_email: '',
        user_display_name: '',
        role: '',
        title: '',
        phone: ''
      });
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" dir="rtl">
        <SheetHeader>
          <SheetTitle>إضافة مشارك جديد</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="user_display_name">الاسم</Label>
            <Input
              id="user_display_name"
              value={formData.user_display_name}
              onChange={(e) => handleChange('user_display_name', e.target.value)}
              placeholder="اسم المشارك"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">البريد الإلكتروني</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => handleChange('user_email', e.target.value)}
              placeholder="example@domain.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">الصفة</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="الصفة الوظيفية"
            />
          </div>
          
          <div className="space-y-2">
            <Label>رقم الجوال</Label>
            <PhoneField 
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور في الاجتماع</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
