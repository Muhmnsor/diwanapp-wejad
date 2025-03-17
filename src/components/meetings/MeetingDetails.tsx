
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeetingDetails } from './hooks/useMeetingDetails';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Link as LinkIcon,
  Users,
  FileText,
  CheckCircle,
  ArrowRightCircle,
  ClipboardList
} from 'lucide-react';
import { MeetingTasksPanel } from './panels/MeetingTasksPanel';
import { MeetingAgendaPanel } from './panels/MeetingAgendaPanel';
import { MeetingParticipantsPanel } from './panels/MeetingParticipantsPanel';
import { MeetingMinutesPanel } from './panels/MeetingMinutesPanel';
import { MeetingDecisionsPanel } from './panels/MeetingDecisionsPanel';

export const MeetingDetails = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        جاري التحميل...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">لم يتم العثور على الاجتماع</h2>
        <p className="text-muted-foreground mb-4">
          الاجتماع المطلوب غير موجود أو تم حذفه
        </p>
        <Button onClick={() => navigate('/meetings')}>
          العودة إلى قائمة الاجتماعات
        </Button>
      </div>
    );
  }

  // Get the preparation, execution, and follow-up tasks
  const preparationTasks = tasks.filter(task => task.task_type === 'preparation');
  const executionTasks = tasks.filter(task => task.task_type === 'execution');
  const followUpTasks = tasks.filter(task => task.task_type === 'follow_up');

  // Get status badge for meeting
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

  // Get meeting type in Arabic
  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case 'board': return 'مجلس إدارة';
      case 'general_assembly': return 'جمعية عمومية';
      case 'committee': return 'لجنة';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/meetings')}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة إلى الاجتماعات
        </Button>
        <div className="flex space-x-2 space-x-reverse">
          {meeting.status === 'upcoming' && (
            <Button variant="outline">
              تعديل الاجتماع
            </Button>
          )}
          {meeting.status === 'upcoming' && (
            <Button>
              بدء الاجتماع
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{meeting.title}</CardTitle>
                  <CardDescription>
                    {getMeetingTypeText(meeting.meeting_type)}
                  </CardDescription>
                </div>
                {getStatusBadge(meeting.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 ml-2 text-gray-500" />
                    <span>
                      {meeting.date && format(new Date(meeting.date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 ml-2 text-gray-500" />
                    <span>
                      {meeting.start_time} ({meeting.duration} دقيقة)
                    </span>
                  </div>
                </div>

                {(meeting.attendance_type === 'in_person' || meeting.attendance_type === 'hybrid') && meeting.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 ml-2 text-gray-500" />
                    <span>{meeting.location}</span>
                  </div>
                )}

                {(meeting.attendance_type === 'remote' || meeting.attendance_type === 'hybrid') && meeting.meeting_link && (
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 ml-2 text-gray-500" />
                    <a 
                      href={meeting.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      رابط الاجتماع الافتراضي
                    </a>
                  </div>
                )}

                {meeting.objectives && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">أهداف الاجتماع:</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{meeting.objectives}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">المشاركون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.length === 0 ? (
                  <p className="text-muted-foreground">لا يوجد مشاركون</p>
                ) : (
                  participants.map(participant => (
                    <div key={participant.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {participant.user?.display_name || participant.user?.email || 'مستخدم غير معروف'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {participant.role === 'chairman' ? 'رئيس' : 
                           participant.role === 'secretary' ? 'مقرر' : 
                           participant.role === 'member' ? 'عضو' : 
                           participant.role === 'observer' ? 'مراقب' : 
                           participant.role}
                        </p>
                      </div>
                      <Badge variant={participant.attendance_status === 'attended' ? 'default' : 'outline'}>
                        {participant.attendance_status === 'pending' ? 'معلق' : 
                         participant.attendance_status === 'confirmed' ? 'مؤكد' :
                         participant.attendance_status === 'declined' ? 'معتذر' :
                         participant.attendance_status === 'attended' ? 'حضر' :
                         participant.attendance_status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 ml-1" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="agenda">
            <ClipboardList className="h-4 w-4 ml-1" />
            جدول الأعمال
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle className="h-4 w-4 ml-1" />
            المهام
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 ml-1" />
            المشاركون
          </TabsTrigger>
          <TabsTrigger value="minutes">
            <FileText className="h-4 w-4 ml-1" />
            محضر الاجتماع
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <ArrowRightCircle className="h-4 w-4 ml-1" />
            القرارات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مهام التحضير</CardTitle>
                <CardDescription>
                  المهام التي يجب إنجازها قبل الاجتماع
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preparationTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد مهام تحضير</p>
                ) : (
                  <div className="space-y-2">
                    {preparationTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-2 px-3 border rounded">
                        <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                          {task.title}
                        </span>
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status === 'pending' ? 'معلق' : 
                           task.status === 'in_progress' ? 'جاري' :
                           task.status === 'completed' ? 'مكتمل' : 
                           task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab('tasks')}
                >
                  عرض كافة المهام
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مهام التنفيذ</CardTitle>
                <CardDescription>
                  المهام التي يجب إنجازها أثناء الاجتماع
                </CardDescription>
              </CardHeader>
              <CardContent>
                {executionTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد مهام تنفيذ</p>
                ) : (
                  <div className="space-y-2">
                    {executionTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-2 px-3 border rounded">
                        <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                          {task.title}
                        </span>
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status === 'pending' ? 'معلق' : 
                           task.status === 'in_progress' ? 'جاري' :
                           task.status === 'completed' ? 'مكتمل' : 
                           task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab('tasks')}
                >
                  عرض كافة المهام
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مهام المتابعة</CardTitle>
                <CardDescription>
                  المهام التي يجب إنجازها بعد الاجتماع
                </CardDescription>
              </CardHeader>
              <CardContent>
                {followUpTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد مهام متابعة</p>
                ) : (
                  <div className="space-y-2">
                    {followUpTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between py-2 px-3 border rounded">
                        <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                          {task.title}
                        </span>
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status === 'pending' ? 'معلق' : 
                           task.status === 'in_progress' ? 'جاري' :
                           task.status === 'completed' ? 'مكتمل' : 
                           task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab('tasks')}
                >
                  عرض كافة المهام
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">جدول الأعمال</CardTitle>
              </CardHeader>
              <CardContent>
                {agendaItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا يوجد بنود في جدول الأعمال</p>
                ) : (
                  <div className="space-y-4">
                    {agendaItems.map((item, index) => (
                      <div key={item.id} className="border p-4 rounded-md">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {item.order_number}
                          </span>
                          <h3 className="font-medium">{item.title}</h3>
                        </div>
                        {item.description && (
                          <p className="mt-2 text-muted-foreground pr-9">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab('agenda')}
                >
                  عرض جدول الأعمال كاملاً
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agenda">
          <MeetingAgendaPanel 
            agendaItems={agendaItems} 
            meetingId={meeting.id} 
          />
        </TabsContent>

        <TabsContent value="tasks">
          <MeetingTasksPanel 
            tasks={tasks} 
            meetingId={meeting.id}
            onAddTask={addTask}
            onUpdateTask={updateTask}
          />
        </TabsContent>

        <TabsContent value="participants">
          <MeetingParticipantsPanel 
            participants={participants} 
            meetingId={meeting.id} 
          />
        </TabsContent>

        <TabsContent value="minutes">
          <MeetingMinutesPanel 
            meetingId={meeting.id} 
            agendaItems={agendaItems}
          />
        </TabsContent>

        <TabsContent value="decisions">
          <MeetingDecisionsPanel 
            decisions={decisions}
            meetingId={meeting.id}
            agendaItems={agendaItems}
            onAddDecision={addDecision}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
