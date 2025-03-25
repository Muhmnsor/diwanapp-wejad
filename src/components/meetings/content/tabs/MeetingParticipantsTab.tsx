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
export const MeetingParticipantsTab: React.FC<MeetingParticipantsTabProps> = ({
  meetingId
}) => {
  const {
    data: participants,
    isLoading,
    error,
    refetch
  } = useMeetingParticipants(meetingId);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participantsTab, setParticipantsTab] = useState("list");
  const handleAddParticipantSuccess = () => {
    refetch();
  };

  // Function to render the appropriate badge for the attendance status
  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> مؤكد
          </Badge>;
      case 'attended':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" /> حضر
          </Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" /> غائب
          </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            معلق
          </Badge>;
    }
  };

  // Function to render the appropriate badge for the role
  const renderRole = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            منظم
          </Badge>;
      case 'presenter':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            مقدم
          </Badge>;
      case 'member':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            عضو
          </Badge>;
      case 'guest':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            ضيف
          </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {role}
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
      

      <AddParticipantDialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen} meetingId={meetingId} onSuccess={handleAddParticipantSuccess} />
    </>;
};