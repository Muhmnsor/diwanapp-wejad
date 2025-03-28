import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { useUsersList } from '@/components/requests/workflow/hooks/useUsersList';
import { useAddMeetingParticipant } from '@/hooks/meetings/useAddMeetingParticipant';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, UserPlus, Edit, Trash, CheckCircle, XCircle, User, Mail, List } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AttendanceStatus, ParticipantRole } from '@/types/meeting';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
interface MeetingParticipantsTabProps {
  meetingId: string;
}

// Form validation schema
const participantFormSchema = z.object({
  userEmail: z.string().email({
    message: "البريد الإلكتروني غير صالح"
  }),
  userDisplayName: z.string().min(2, {
    message: "يجب أن يكون الاسم أكثر من حرفين"
  }),
  role: z.enum(["organizer", "member", "presenter", "guest"], {
    required_error: "الرجاء اختيار الدور"
  })
});
type ParticipantFormValues = z.infer<typeof participantFormSchema>;
export const MeetingParticipantsTab: React.FC<MeetingParticipantsTabProps> = ({
  meetingId
}) => {
  const {
    data: participants,
    isLoading,
    error,
    refetch
  } = useMeetingParticipants(meetingId);
  const {
    users,
    isLoading: isUsersLoading
  } = useUsersList();
  const {
    mutate: addParticipant,
    isPending: isAddingParticipant
  } = useAddMeetingParticipant();
  const [isParticipantSheetOpen, setIsParticipantSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    display_name: string;
    email: string;
  } | null>(null);

  // Setup form with react-hook-form
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      userEmail: "",
      userDisplayName: "",
      role: "member"
    }
  });

  // Update form values when a user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setValue("userEmail", selectedUser.email);
      form.setValue("userDisplayName", selectedUser.display_name);
    }
  }, [selectedUser, form]);
  const handleUserSelect = (user: {
    id: string;
    display_name: string;
    email: string;
  }) => {
    setSelectedUser(user);
  };
  const handleClearSelection = () => {
    setSelectedUser(null);
    form.reset({
      userEmail: "",
      userDisplayName: "",
      role: "member"
    });
  };
  const onSubmit = (values: ParticipantFormValues) => {
    addParticipant({
      meetingId,
      participant: {
        user_email: values.userEmail,
        user_display_name: values.userDisplayName,
        role: values.role as ParticipantRole,
        attendance_status: "pending" as AttendanceStatus
      }
    }, {
      onSuccess: () => {
        setIsParticipantSheetOpen(false);
        form.reset();
        setSelectedUser(null);
        refetch();
        toast.success("تمت إضافة المشارك بنجاح");
      },
      onError: error => {
        console.error("Error adding participant:", error);
        toast.error("حدث خطأ أثناء إضافة المشارك");
      }
    });
  };
  const handleUpdateAttendance = async (participantId: string, newStatus: string) => {
    try {
      const {
        error
      } = await supabase.from('meeting_participants').update({
        attendance_status: newStatus
      }).eq('id', participantId);
      if (error) throw error;
      refetch();
      toast.success("تم تحديث حالة الحضور بنجاح");
    } catch (error) {
      console.error("Error updating attendance status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الحضور");
    }
  };
  const handleUpdateRole = async (participantId: string, newRole: string) => {
    try {
      const {
        error
      } = await supabase.from('meeting_participants').update({
        role: newRole
      }).eq('id', participantId);
      if (error) throw error;
      refetch();
      toast.success("تم تحديث الدور بنجاح");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("حدث خطأ أثناء تحديث الدور");
    }
  };
  const handleDeleteParticipant = async (participantId: string) => {
    try {
      const {
        error
      } = await supabase.from('meeting_participants').delete().eq('id', participantId);
      if (error) throw error;
      refetch();
      toast.success("تم حذف المشارك بنجاح");
    } catch (error) {
      console.error("Error deleting participant:", error);
      toast.error("حدث خطأ أثناء حذف المشارك");
    }
  };

  // Function to render role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">منظم</Badge>;
      case 'presenter':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">مقدم</Badge>;
      case 'member':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">عضو</Badge>;
      case 'guest':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">ضيف</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{role}</Badge>;
    }
  };

  // Function to render attendance status badge
  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 ml-1" /> مؤكد
          </Badge>;
      case 'attended':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 ml-1" /> حضر
          </Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 ml-1" /> غائب
          </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            معلق
          </Badge>;
    }
  };
  if (isLoading) {
    return <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    console.error('Error fetching meeting participants:', error);
    return <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل المشاركين</p>
        </CardContent>
      </Card>;
  }
  return <>
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>المشاركون ({participants?.length || 0})</CardTitle>
          <Button onClick={() => setIsParticipantSheetOpen(true)}>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة مشارك
          </Button>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? <div className="text-center py-12 border rounded-md bg-gray-50">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">لا يوجد مشاركون في هذا الاجتماع بعد</p>
              <Button onClick={() => setIsParticipantSheetOpen(true)} variant="outline">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مشارك جديد
              </Button>
            </div> : <div className="border rounded-md overflow-hidden">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead>المشارك</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>حالة الحضور</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map(participant => <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{participant.user_display_name}</span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 ml-1" />
                            {participant.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={participant.role} onValueChange={value => handleUpdateRole(participant.id, value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="organizer">منظم</SelectItem>
                            <SelectItem value="presenter">مقدم</SelectItem>
                            <SelectItem value="member">عضو</SelectItem>
                            <SelectItem value="guest">ضيف</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={participant.attendance_status} onValueChange={value => handleUpdateAttendance(participant.id, value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="attended">حضر</SelectItem>
                            <SelectItem value="absent">غائب</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteParticipant(participant.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

      {/* Add Participant Sheet */}
      <Sheet open={isParticipantSheetOpen} onOpenChange={setIsParticipantSheetOpen}>
        
      </Sheet>
    </>;
};