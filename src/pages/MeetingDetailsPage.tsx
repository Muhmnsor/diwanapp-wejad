
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMeetingDetails } from '@/components/meetings/hooks/useMeetingDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, MapPin, Video, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MeetingAgendaPanel } from '@/components/meetings/panels/MeetingAgendaPanel';
import { MeetingTasksPanel } from '@/components/meetings/panels/MeetingTasksPanel';
import { MeetingDecisionsPanel } from '@/components/meetings/panels/MeetingDecisionsPanel';
import { MeetingParticipantsPanel } from '@/components/meetings/panels/MeetingParticipantsPanel';
import { MeetingMinutesPanel } from '@/components/meetings/panels/MeetingMinutesPanel';
import { Badge } from '@/components/ui/badge';

const MeetingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState('agenda');
  
  if (!id) {
    return <div className="p-8 text-center">معرف الاجتماع غير صالح</div>;
  }

  const {
    meeting,
    participants,
    agendaItems,
    tasks,
    decisions,
    attachments,
    isLoading,
    addParticipant,
    addTask,
    updateTask,
    addDecision,
  } = useMeetingDetails(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-medium">جاري تحميل بيانات الاجتماع...</h3>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          لم يتم العثور على بيانات الاجتماع. قد يكون الاجتماع محذوفاً أو ليس لديك صلاحية الوصول إليه.
        </AlertDescription>
      </Alert>
    );
  }

  const getAttendanceTypeLabel = (type: string) => {
    switch (type) {
      case 'in_person': return 'حضوري';
      case 'remote': return 'عن بعد';
      case 'hybrid': return 'مختلط';
      default: return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'قادم';
      case 'in_progress': return 'جاري';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Meeting Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className={getStatusBadgeColor(meeting.status)}>
                {getStatusLabel(meeting.status)}
              </Badge>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-gray-600">{meeting.meeting_type}</span>
            </div>
          </div>
        </div>

        {meeting.description && (
          <p className="text-gray-700 mt-2 mb-4">{meeting.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 ml-2" />
            <div>
              <span className="text-sm text-gray-500">التاريخ</span>
              <p className="font-medium">{meeting.date}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 ml-2" />
            <div>
              <span className="text-sm text-gray-500">الوقت</span>
              <p className="font-medium">{meeting.start_time} - {meeting.end_time}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 ml-2" />
            <div>
              <span className="text-sm text-gray-500">نوع الحضور</span>
              <p className="font-medium">{getAttendanceTypeLabel(meeting.attendance_type)}</p>
            </div>
          </div>

          {meeting.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 ml-2" />
              <div>
                <span className="text-sm text-gray-500">المكان</span>
                <p className="font-medium">{meeting.location}</p>
              </div>
            </div>
          )}

          {meeting.meeting_link && (
            <div className="flex items-center">
              <Video className="h-5 w-5 text-gray-500 ml-2" />
              <div>
                <span className="text-sm text-gray-500">رابط الاجتماع</span>
                <p className="font-medium">
                  <a 
                    href={meeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    الانضمام للاجتماع
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="mb-6">
              <TabsTrigger value="agenda">جدول الأعمال</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="decisions">القرارات</TabsTrigger>
              <TabsTrigger value="minutes">محضر الاجتماع</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agenda">
              <MeetingAgendaPanel 
                meetingId={id} 
                agendaItems={agendaItems} 
              />
            </TabsContent>
            
            <TabsContent value="tasks">
              <MeetingTasksPanel 
                tasks={tasks} 
                meetingId={id}
                onAddTask={addTask}
                onUpdateTask={updateTask}
              />
            </TabsContent>
            
            <TabsContent value="decisions">
              <MeetingDecisionsPanel 
                meetingId={id} 
                decisions={decisions}
                agendaItems={agendaItems}
                onAddDecision={addDecision}
              />
            </TabsContent>
            
            <TabsContent value="minutes">
              <MeetingMinutesPanel 
                meetingId={id} 
                agendaItems={agendaItems}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <MeetingParticipantsPanel 
            meetingId={id} 
            participants={participants}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
