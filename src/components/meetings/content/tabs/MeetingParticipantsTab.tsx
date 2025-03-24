
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, UserPlus, Mail, User, CheckCircle, XCircle, Clipboard, List } from 'lucide-react';
import { AddParticipantDialog } from '../../participants/AddParticipantDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MeetingParticipantsTabProps {
  meetingId: string;
}

export const MeetingParticipantsTab: React.FC<MeetingParticipantsTabProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error, refetch } = useMeetingParticipants(meetingId);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participantsTab, setParticipantsTab] = useState("list");

  const handleAddParticipantSuccess = () => {
    refetch();
  };

  // Function to render the appropriate badge for the attendance status
  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> مؤكد
          </Badge>
        );
      case 'attended':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" /> حضر
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" /> غائب
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            معلق
          </Badge>
        );
    }
  };

  // Function to render the appropriate badge for the role
  const renderRole = (role: string) => {
    switch (role) {
      case 'organizer':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            منظم
          </Badge>
        );
      case 'presenter':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            مقدم
          </Badge>
        );
      case 'member':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            عضو
          </Badge>
        );
      case 'guest':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            ضيف
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {role}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
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
      </Card>
    );
  }

  if (error) {
    console.error('Error fetching meeting participants:', error);
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">حدث خطأ أثناء تحميل المشاركين</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>المشاركون ({participants?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsAddParticipantOpen(true)}>
            <UserPlus className="h-4 w-4 ml-1" />
            إضافة مشارك
          </Button>
        </CardHeader>
        
        <Tabs value={participantsTab} onValueChange={setParticipantsTab} className="w-full">
          <TabsList className="mx-4 mb-4">
            <TabsTrigger value="list">
              <List className="h-4 w-4 ml-1" />
              قائمة المشاركين
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Clipboard className="h-4 w-4 ml-1" />
              تسجيل الحضور
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <CardContent>
              {!participants || participants.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">لا يوجد مشاركون في هذا الاجتماع</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => setIsAddParticipantOpen(true)}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مشارك
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <div key={participant.id} className="border rounded-md p-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium text-gray-900">
                            {participant.user_display_name || 'مشارك'}
                          </h4>
                          <div className="flex items-center text-gray-500">
                            <Mail className="h-4 w-4 ml-1" />
                            {participant.user_email}
                          </div>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          {renderRole(participant.role)}
                          {renderAttendanceStatus(participant.attendance_status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="attendance">
            <CardContent>
              <div className="text-center py-6">
                <Clipboard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">تسجيل الحضور</h3>
                <p className="text-gray-500 mb-6">قم بتسجيل حضور المشاركين في الاجتماع</p>
                
                {!participants || participants.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">لا يوجد مشاركون لتسجيل حضورهم</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddParticipantOpen(true)}
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة مشارك
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="border rounded-md p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 ml-2" />
                          <div>
                            <p className="font-medium">{participant.user_display_name}</p>
                            <p className="text-sm text-gray-500">{participant.user_email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button 
                            size="sm" 
                            variant={participant.attendance_status === 'attended' ? 'default' : 'outline'}
                            className={participant.attendance_status === 'attended' ? 'bg-green-600' : ''}
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            حضر
                          </Button>
                          <Button 
                            size="sm" 
                            variant={participant.attendance_status === 'absent' ? 'default' : 'outline'}
                            className={participant.attendance_status === 'absent' ? 'bg-red-600' : ''}
                          >
                            <XCircle className="h-4 w-4 ml-1" />
                            غائب
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <AddParticipantDialog
        open={isAddParticipantOpen}
        onOpenChange={setIsAddParticipantOpen}
        meetingId={meetingId}
        onSuccess={handleAddParticipantSuccess}
      />
    </>
  );
};
