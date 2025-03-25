
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAddMeetingParticipant } from '@/hooks/meetings/useAddMeetingParticipant';
import { ParticipantRole, AttendanceStatus } from '@/types/meeting';

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
  const [role, setRole] = useState<ParticipantRole>('عضو');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addParticipantMutation = useAddMeetingParticipant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !displayName || !role) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the current user to set as the creator
      const { data: userData } = await supabase.auth.getUser();
      const creatorId = userData?.user?.id;
      
      // Generate a UUID for the user_id field since it's required
      // This would typically be a reference to an actual user, but for external participants
      // we'll generate a unique ID
      const externalUserId = uuidv4();
      
      // Use the mutation from the hook
      addParticipantMutation.mutate({
        meetingId,
        participant: {
          user_id: externalUserId,
          user_email: email,
          user_display_name: displayName,
          role: role,
          attendance_status: 'pending',
          created_by: creatorId
        }
      }, {
        onSuccess: () => {
          onSuccess();
          onOpenChange(false);
          
          // Reset form
          setEmail('');
          setDisplayName('');
          setRole('عضو');
        },
        onError: (error) => {
          console.error('Error adding participant:', error);
          toast.error('حدث خطأ أثناء إضافة المشارك');
        }
      });
    } catch (error) {
      console.error('Exception adding participant:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
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
                <SelectItem value="رئيس">رئيس</SelectItem>
                <SelectItem value="عضو">عضو</SelectItem>
                <SelectItem value="مقرر">مقرر</SelectItem>
                <SelectItem value="ضيف">ضيف</SelectItem>
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
            <Button type="submit" disabled={isSubmitting || addParticipantMutation.isPending}>
              {isSubmitting || addParticipantMutation.isPending ? 'جاري الإضافة...' : 'إضافة المشارك'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
