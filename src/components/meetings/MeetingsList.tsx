
import React from 'react';
import { useMeetings } from './hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { NewMeetingDialog } from './dialogs/NewMeetingDialog';
import { Skeleton } from "@/components/ui/skeleton";

export const MeetingsList = () => {
  const { meetings, isLoading, error, filter, setFilter, refetch } = useMeetings();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  // Log component render and data state for debugging
  useEffect(() => {
    console.log("MeetingsList rendered with:", { 
      isLoading, 
      hasError: !!error, 
      meetingsCount: meetings?.length || 0,
      filter 
    });
    
    if (error) {
      console.error("Meetings list error:", error);
    }
  }, [meetings, isLoading, error, filter]);

  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleMeetingClick = (meetingId: string) => {
    navigate(`/meetings/${meetingId}`);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setIsRetrying(false);
    }
  };

  // Error state component
  if (error) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">الاجتماعات</h2>
          <Button onClick={() => setShowNewMeetingDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            اجتماع جديد
          </Button>
        </div>
        
        <Card className="p-8 text-center bg-red-50">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <CardTitle className="mb-2">حدث خطأ</CardTitle>
          <CardDescription className="text-red-700">
            تعذر تحميل الاجتماعات. {error.message || 'يرجى المحاولة مرة أخرى لاحقاً.'}
          </CardDescription>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                جاري المحاولة...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </>
            )}
          </Button>
        </Card>

        <NewMeetingDialog 
          open={showNewMeetingDialog} 
          onOpenChange={setShowNewMeetingDialog} 
        />
      </div>
    );
  }

  // Loading state with better feedback
  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">الاجتماعات</h2>
          <Button disabled>
            <Plus className="h-4 w-4 ml-2" />
            اجتماع جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الاجتماعات</h2>
        <Button onClick={() => setShowNewMeetingDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          اجتماع جديد
        </Button>
      </div>

      <div className="flex space-x-4 space-x-reverse">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="البحث عن اجتماع..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="upcoming">القادمة</SelectItem>
            <SelectItem value="completed">المكتملة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredMeetings.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <CardTitle className="mb-2">لا توجد اجتماعات</CardTitle>
          <CardDescription>
            لم يتم العثور على اجتماعات تطابق معايير البحث الحالية
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <Card 
              key={meeting.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleMeetingClick(meeting.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  {getStatusBadge(meeting.status)}
                </div>
                <CardDescription>
                  {getMeetingTypeText(meeting.meeting_type)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 ml-2 text-gray-500" />
                    <span>
                      {meeting.date 
                        ? format(new Date(meeting.date), 'dd/MM/yyyy') 
                        : 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 ml-2 text-gray-500" />
                    <span>
                      {meeting.start_time} ({meeting.duration} دقيقة)
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 ml-2 text-gray-500" />
                    <span>
                      نوع الحضور: {
                        meeting.attendance_type === 'in_person' ? 'حضوري' :
                        meeting.attendance_type === 'remote' ? 'عن بعد' :
                        meeting.attendance_type === 'hybrid' ? 'هجين' : 
                        meeting.attendance_type
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewMeetingDialog 
        open={showNewMeetingDialog} 
        onOpenChange={setShowNewMeetingDialog} 
      />
    </div>
  );
};
