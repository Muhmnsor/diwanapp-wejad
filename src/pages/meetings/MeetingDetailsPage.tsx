
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useMeetingAgendaItems } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingObjectives } from "@/hooks/meetings/useMeetingObjectives";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, MapPin, Link2, Users, ArrowLeft, Edit, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDateArabic } from "@/utils/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const MeetingDetailsPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: meeting, isLoading: isMeetingLoading, error: meetingError } = useMeeting(meetingId || '');
  const { data: agendaItems, isLoading: isAgendaLoading } = useMeetingAgendaItems(meetingId || '');
  const { data: objectives, isLoading: isObjectivesLoading } = useMeetingObjectives(meetingId || '');
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    // Edit functionality will be implemented later
    console.log('Edit meeting:', meetingId);
  };
  
  const handleDelete = () => {
    if (meetingId) {
      deleteMeeting(meetingId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          navigate('/admin/meetings');
        }
      });
    }
  };
  
  if (isMeetingLoading) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" onClick={handleBack} className="ml-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              عودة
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (meetingError || !meeting) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل بيانات الاجتماع</h2>
              <p className="text-gray-600 mb-6">{(meetingError as Error)?.message || 'لم يتم العثور على الاجتماع المطلوب'}</p>
              <Button onClick={handleBack}>العودة</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Header with back button and title */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Button variant="ghost" size="sm" onClick={handleBack} className="ml-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              عودة
            </Button>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" onClick={handleEdit} className="ml-2">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rtl text-right">
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من حذف هذا الاجتماع؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف الاجتماع وجميع بيانات جدول الأعمال والأهداف المرتبطة به بشكل نهائي.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'جاري الحذف...' : 'حذف'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Meeting status badge */}
        <div className="mb-6">
          <Badge 
            className={
              meeting.meeting_status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              meeting.meeting_status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
              meeting.meeting_status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
              'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }
          >
            {
              meeting.meeting_status === 'completed' ? 'مكتمل' :
              meeting.meeting_status === 'in_progress' ? 'جاري حالياً' :
              meeting.meeting_status === 'cancelled' ? 'ملغي' :
              'قادم'
            }
          </Badge>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column for meeting details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                <TabsTrigger value="agenda">جدول الأعمال</TabsTrigger>
                <TabsTrigger value="objectives">الأهداف</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="min-h-[400px]">
                <Card>
                  <CardHeader>
                    <CardTitle>تفاصيل الاجتماع</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">التاريخ</h3>
                          <p className="text-sm text-gray-600">{meeting.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <Clock className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">الوقت والمدة</h3>
                          <p className="text-sm text-gray-600">{meeting.start_time} (مدة: {meeting.duration} دقيقة)</p>
                        </div>
                      </div>
                      
                      {meeting.location && (
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <MapPin className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-1">المكان</h3>
                            <p className="text-sm text-gray-600">{meeting.location}</p>
                          </div>
                        </div>
                      )}
                      
                      {meeting.meeting_link && (
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <Link2 className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-1">رابط الاجتماع</h3>
                            <a 
                              href={meeting.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {meeting.meeting_link}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <Users className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">نوع الحضور</h3>
                          <p className="text-sm text-gray-600">
                            {meeting.attendance_type === 'in_person' ? 'حضوري' : 
                             meeting.attendance_type === 'virtual' ? 'افتراضي' : 'مختلط'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">المجلد</h3>
                      <div 
                        className="py-2 px-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => navigate(`/admin/meetings/folders/${meeting.folder_id}`)}
                      >
                        <p className="text-sm">{meeting.folder?.name || 'المجلد الرئيسي'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">معلومات إضافية</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">تاريخ الإنشاء:</span>{' '}
                          <span>{formatDateArabic(meeting.created_at || '')}</span>
                        </div>
                        {meeting.updated_at && (
                          <div>
                            <span className="text-gray-600">آخر تحديث:</span>{' '}
                            <span>{formatDateArabic(meeting.updated_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="agenda" className="min-h-[400px]">
                <Card>
                  <CardHeader>
                    <CardTitle>جدول أعمال الاجتماع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAgendaLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : agendaItems && agendaItems.length > 0 ? (
                      <ul className="space-y-4">
                        {agendaItems.map((item) => (
                          <li key={item.id} className="flex bg-gray-50 rounded-md overflow-hidden shadow-sm">
                            <div className="flex items-center justify-center bg-primary text-white w-10 text-lg">
                              {item.order_number}
                            </div>
                            <div className="p-4 flex-1">
                              <p>{item.content}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <p>لا توجد عناصر في جدول الأعمال</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="objectives" className="min-h-[400px]">
                <Card>
                  <CardHeader>
                    <CardTitle>أهداف الاجتماع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isObjectivesLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : objectives && objectives.length > 0 ? (
                      <ul className="space-y-4">
                        {objectives.map((objective) => (
                          <li key={objective.id} className="flex bg-gray-50 rounded-md overflow-hidden shadow-sm">
                            <div className="flex items-center justify-center bg-primary text-white w-10 text-lg">
                              {objective.order_number}
                            </div>
                            <div className="p-4 flex-1">
                              <p>{objective.content}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <p>لا توجد أهداف محددة للاجتماع</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column for additional info */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                <Button className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  إدارة المشاركين
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  إضافة إلى التقويم
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trash className="mr-2 h-4 w-4" />
                  حذف الاجتماع
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">القرارات والمهام</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    إضافة قرار جديد
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    إضافة مهمة جديدة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MeetingDetailsPage;
