
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
  onSuccess: () => void;
}

export const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<ParticipantRole>('member');
  const { mutate: addParticipant, isPending: isSubmitting } = useAddMeetingParticipant();
  const { availableRoles } = useParticipantRoles(meetingId);
  const { getRoleLabel } = useMeetingRoles();

  // Reset role selection if current role is not available
  useEffect(() => {
    if (open && availableRoles.length > 0 && !availableRoles.includes(role)) {
      setRole(availableRoles[0]);
    }
  }, [open, availableRoles, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !displayName || !role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    try {
      // Get the current user to set as the creator
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id;
      
      // Add the participant using the hook
      addParticipant({
        meetingId,
        participant: {
          user_email: email,
          user_display_name: displayName,
          role: role,
          attendance_status: 'pending' as AttendanceStatus,
          // If this participant is a registered user with this email, we should ideally
          // look up their ID. For now, we use a placeholder UUID that will be generated in the hook.
        }
      }, {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
          
          // Reset form
          setEmail('');
          setDisplayName('');
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
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة المشارك'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
