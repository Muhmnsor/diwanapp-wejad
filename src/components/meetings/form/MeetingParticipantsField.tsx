
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon, Plus, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormDescription } from '@/components/ui/form';
import { ParticipantFieldWrapper } from './ParticipantFieldWrapper';

interface User {
  id: string;
  display_name?: string;
  email?: string;
}

interface MeetingParticipantsFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingParticipantsField = ({ form }: MeetingParticipantsFieldProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  // Fetch users from the database
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
  });

  // Get unique user IDs already in the participants array
  const participantUserIds = fields.map(field => field.id);

  // Filter out users that are already participants
  const availableUsers = users.filter(user => !participantUserIds.includes(user.id));

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.display_name || user?.email || 'مستخدم غير معروف';
  };

  const addParticipant = () => {
    if (availableUsers.length > 0) {
      append({ 
        id: availableUsers[0].id,
        role: 'member'
      });
    }
  };

  if (isLoading) {
    return <div>جاري تحميل المستخدمين...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">المشاركون في الاجتماع</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addParticipant}
          disabled={availableUsers.length === 0}
        >
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة مشارك
        </Button>
      </div>

      <FormDescription>
        قم بإضافة المشاركين وتحديد أدوارهم في الاجتماع
      </FormDescription>

      {fields.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">لا يوجد مشاركين. قم بإضافة مشاركين للاجتماع.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-4 border p-3 rounded-md">
              <ParticipantFieldWrapper
                form={form}
                name={`participants.${index}.id`}
                label="المشارك"
              >
                <Select
                  onValueChange={(value) => form.setValue(`participants.${index}.id`, value)}
                  defaultValue={field.id}
                >
                  <SelectTrigger id={`user-${index}`}>
                    <SelectValue placeholder="اختر مشارك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={field.id}>
                      {getUserNameById(field.id)}
                    </SelectItem>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name || user.email || 'مستخدم غير معروف'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ParticipantFieldWrapper>

              <ParticipantFieldWrapper
                form={form}
                name={`participants.${index}.role`}
                label="الدور"
              >
                <Select
                  onValueChange={(value) => form.setValue(`participants.${index}.role`, value)}
                  defaultValue={field.role}
                >
                  <SelectTrigger id={`role-${index}`}>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chairman">رئيس</SelectItem>
                    <SelectItem value="secretary">مقرر</SelectItem>
                    <SelectItem value="member">عضو</SelectItem>
                    <SelectItem value="observer">مراقب</SelectItem>
                  </SelectContent>
                </Select>
              </ParticipantFieldWrapper>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {form.formState.errors.participants?.root?.message && (
        <FormMessage>
          {String(form.formState.errors.participants?.root?.message)}
        </FormMessage>
      )}
    </div>
  );
};
