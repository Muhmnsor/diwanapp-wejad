
import React, { useEffect } from 'react';
import { useMeetingDetails } from '@/components/meetings/hooks/useMeetingDetails';
import { useTaskUpdater } from '@/components/meetings/hooks/useTaskUpdater';
import { MeetingAgendaPanel } from '@/components/meetings/panels/MeetingAgendaPanel';
import { MeetingTasksPanel } from '@/components/meetings/panels/MeetingTasksPanel';
import { MeetingParticipantsPanel } from '@/components/meetings/panels/MeetingParticipantsPanel';
import { MeetingMinutesPanel } from '@/components/meetings/panels/MeetingMinutesPanel';
import { MeetingDecisionsPanel } from '@/components/meetings/panels/MeetingDecisionsPanel';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Link, 
  Users, 
  Target, 
  BadgeInfo, 
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Create a spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// Define props interface for the component
interface MeetingDetailsProps {
  meetingId: string;
}

export const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meetingId }) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  const { 
    meeting, 
    participants, 
    agendaItems, 
    tasks, 
    decisions, 
    isLoading, 
    addTask, 
    updateTask, 
    addDecision 
  } = useMeetingDetails(meetingId);

  // Use the task updater utility to match the expected function signature
  const handleUpdateTask = useTaskUpdater(updateTask);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="mr-2">جاري تحميل بيانات الاجتماع...</span>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الاجتماع</h2>
        <p className="text-muted-foreground">
          قد يكون الاجتماع محذوفاً أو ليس لديك صلاحية الوصول إليه
        </p>
      </div>
    );
  }

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">قادم</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">جاري</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Meeting type translation
  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case 'board': return 'مجلس إدارة';
      case 'general_assembly': return 'جمعية عمومية';
      case 'committee': return 'لجنة';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  const getAttendanceTypeText = (type: string) => {
    switch (type) {
      case 'in_person': return 'حضوري';
      case 'remote': return 'عن بعد';
      case 'hybrid': return 'هجين';
      default: return type;
    }
  };

  // Map URL activeTab to the Tabs component value
  const getTabsValue = () => {
    switch (activeTab) {
      case 'tasks': return 'tasks';
      case 'participants': return 'participants';
      case 'minutes': return 'minutes';
      case 'decisions': return 'decisions';
      default: return 'agenda'; // Default to agenda for 'overview' or unknown
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          {getStatusBadge(meeting.status)}
          <Badge variant="secondary">{getMeetingTypeText(meeting.meeting_type)}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 ml-2 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">التاريخ</div>
              <div>{meeting.date ? format(new Date(meeting.date), 'dd/MM/yyyy') : 'غير محدد'}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 ml-2 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">الوقت والمدة</div>
              <div>{meeting.start_time} ({meeting.duration} دقيقة)</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 ml-2 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">نوع الحضور</div>
              <div>{getAttendanceTypeText(meeting.attendance_type)}</div>
            </div>
          </div>
        </div>
        
        {(meeting.location || meeting.meeting_link) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {meeting.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 ml-2 text-gray-500" />
                <div>
                  <div className="text-sm text-muted-foreground">المكان</div>
                  <div>{meeting.location}</div>
                </div>
              </div>
            )}
            
            {meeting.meeting_link && (
              <div className="flex items-center">
                <Link className="h-5 w-5 ml-2 text-gray-500" />
                <div>
                  <div className="text-sm text-muted-foreground">رابط الاجتماع</div>
                  <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    فتح الرابط
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        
        {meeting.objectives && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="ml-2 h-5 w-5 text-primary" />
                أهداف الاجتماع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{meeting.objectives}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue={getTabsValue()} className="w-full">
        <TabsContent value="agenda">
          <MeetingAgendaPanel 
            agendaItems={agendaItems}
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <MeetingTasksPanel 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask}
            onAddTask={addTask}
          />
        </TabsContent>
        
        <TabsContent value="participants">
          <MeetingParticipantsPanel 
            participants={participants}
          />
        </TabsContent>
        
        <TabsContent value="minutes">
          <MeetingMinutesPanel 
            agendaItems={agendaItems}
            minutes={null}
          />
        </TabsContent>
        
        <TabsContent value="decisions">
          <MeetingDecisionsPanel 
            decisions={decisions}
            agendaItems={agendaItems}
            onAddDecision={addDecision}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
