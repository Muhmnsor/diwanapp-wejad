
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingOverviewTab } from './tabs/MeetingOverviewTab';
import { MeetingMinutesTab } from './tabs/MeetingMinutesTab';
import { MeetingParticipantsContent } from '../participants/MeetingParticipantsContent';
import { MeetingTasksTab } from './tabs/MeetingTasksTab';
import { Meeting, MeetingStatus } from '@/types/meeting';
import { ParticipantDialogBridge } from '../participants/ParticipantDialogBridge';
import { EnhancedMeetingMinutes } from '../minutes/EnhancedMeetingMinutes';
import { useMeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { MeetingStatusBadge } from '../status/MeetingStatusBadge';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useDeleteMeeting } from '@/hooks/meetings/useDeleteMeeting';

interface MeetingDetailsTabsProps {
  meeting: Meeting;
  meetingId: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MeetingDetailsTabs: React.FC<MeetingDetailsTabsProps> = ({ 
  meeting, 
  meetingId, 
  onBack,
  onEdit,
  onDelete 
}) => {
  const { data: minutes, isLoading: isMinutesLoading } = useMeetingMinutes(meetingId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting();
  
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    } else {
      deleteMeeting(meetingId);
    }
    setShowDeleteDialog(false);
  };

  return (
    <Tabs defaultValue="overview" className="w-full" dir="rtl">
      <div className="flex items-center justify-between border-b mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <MeetingStatusBadge status={meeting.meeting_status as MeetingStatus} />
        </div>
        
        <div className="flex items-center">
          <TabsList className="flex justify-center bg-white rounded-none">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger 
              value="participants" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              المشاركون
            </TabsTrigger>
            <TabsTrigger 
              value="minutes" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              المحضر
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              المهام
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 mr-4">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4 ml-1" />
              حذف
            </Button>
            
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="mr-2">
                <ArrowLeft className="h-4 w-4 ml-2" />
                عودة
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <TabsContent value="overview" dir="rtl">
        <MeetingOverviewTab meeting={meeting} meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="participants" dir="rtl">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">المشاركون في الاجتماع</h3>
          <ParticipantDialogBridge meetingId={meetingId} onSuccess={() => {}} />
        </div>
        <MeetingParticipantsContent meetingId={meetingId} />
      </TabsContent>
      
      <TabsContent value="minutes" dir="rtl">
        <EnhancedMeetingMinutes 
          meetingId={meetingId} 
          minutes={minutes}
          isLoading={isMinutesLoading}
        >
          <MeetingMinutesTab meetingId={meetingId} />
        </EnhancedMeetingMinutes>
      </TabsContent>
      
      <TabsContent value="tasks" dir="rtl">
        <MeetingTasksTab meetingId={meetingId} />
      </TabsContent>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="تأكيد حذف الاجتماع"
        description="هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ لا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Tabs>
  );
};

