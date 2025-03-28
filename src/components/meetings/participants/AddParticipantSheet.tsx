
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParticipantRole } from '@/types/meeting';
import { useParticipantRoles } from '@/hooks/meetings/useParticipantRoles';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';
import { UserSelector } from './UserSelector';

interface AddParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    user_id?: string;
    user_email: string;
    user_display_name: string;
    role: ParticipantRole;
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
  const [participantType, setParticipantType] = useState<'system' | 'external'>('system');
  const [selectedUser, setSelectedUser] = useState<{ id: string, email: string, name: string } | null>(null);
  const [role, setRole] = useState<ParticipantRole>('member');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');

  const { getRoleOptions } = useMeetingRoles();
  const roleOptions = getRoleOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (participantType === 'system' && selectedUser) {
      onSubmit({
        user_id: selectedUser.id,
        user_email: selectedUser.email,
        user_display_name: selectedUser.name,
        role,
        title,
        phone,
        is_system_user: true
      });
    } else if (participantType === 'external') {
      onSubmit({
        user_email: userEmail,
        user_display_name: userName,
        role,
        title,
        phone,
        is_system_user: false
      });
    }
  };

  const handleUserSelect = (user: { id: string, email: string, name: string }) => {
    setSelectedUser(user);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right mb-4">
          <SheetTitle>إضافة مشارك</SheetTitle>
          <SheetDescription>
            أضف مشاركًا جديدًا إلى الاجتماع
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-base">نوع المشارك</Label>
            <div className="flex space-x-4 space-x-reverse">
              <Button
                type="button"
                variant={participantType === 'system' ? 'secondary' : 'outline'}
                onClick={() => setParticipantType('system')}
                className="flex-1"
              >
                مستخدم النظام
              </Button>
              <Button
                type="button"
                variant={participantType === 'external' ? 'secondary' : 'outline'}
                onClick={() => setParticipantType('external')}
                className="flex-1"
              >
                مشارك خارجي
              </Button>
            </div>
          </div>
          
          {participantType === 'system' ? (
            <div className="space-y-2">
              <Label>مستخدم النظام</Label>
              <UserSelector onUserSelect={handleUserSelect} />
              {selectedUser && (
                <div className="p-2 bg-primary/10 rounded-md mt-2">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">اسم المشارك</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">البريد الإلكتروني</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">المنصب / المسمى الوظيفي</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="المنصب أو المسمى الوظيفي"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              pattern="^05\d{8}$"
              title="يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">الدور في الاجتماع</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as ParticipantRole)}
            >
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
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || 
                (participantType === 'system' && !selectedUser) || 
                (participantType === 'external' && (!userEmail || !userName))
              }
            >
              {isPending ? 'جارٍ الإضافة...' : 'إضافة'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
