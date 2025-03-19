
import { useState } from "react";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Loader2, 
  Calendar, 
  Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  onMeetingClick: (meetingId: string) => void;
  onStatusFilterChange?: (status: string | undefined) => void;
  onTypeFilterChange?: (type: string | undefined) => void;
}

export const MeetingsTable = ({ 
  meetings, 
  isLoading, 
  error, 
  onMeetingClick,
  onStatusFilterChange,
  onTypeFilterChange
}: MeetingsTableProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };
  
  const formatTime = (timeString: string) => {
    return timeString;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">مجدول</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">جاري</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getMeetingTypeName = (type: string) => {
    switch (type) {
      case 'board': return 'مجلس إدارة';
      case 'department': return 'قسم';
      case 'team': return 'فريق';
      case 'committee': return 'لجنة';
      case 'other': return 'أخرى';
      default: return type;
    }
  };
  
  const filteredMeetings = meetings.filter(meeting => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        meeting.title.toLowerCase().includes(query) ||
        (meeting.objectives && meeting.objectives.toLowerCase().includes(query))
      );
    }
    return true;
  });
  
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'meeting_type':
        comparison = a.meeting_type.localeCompare(b.meeting_type);
        break;
      case 'meeting_status':
        comparison = a.meeting_status.localeCompare(b.meeting_status);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل الاجتماعات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل الاجتماعات: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <Label htmlFor="search-meetings" className="mb-2 block">بحث</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-meetings"
              placeholder="ابحث عن اجتماعات..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {onStatusFilterChange && (
          <div className="w-full md:w-1/3">
            <Label htmlFor="status-filter" className="mb-2 block">تصفية حسب الحالة</Label>
            <Select onValueChange={(value) => onStatusFilterChange(value || undefined)} defaultValue="">
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="scheduled">مجدول</SelectItem>
                <SelectItem value="in_progress">جاري</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {onTypeFilterChange && (
          <div className="w-full md:w-1/3">
            <Label htmlFor="type-filter" className="mb-2 block">تصفية حسب النوع</Label>
            <Select onValueChange={(value) => onTypeFilterChange(value || undefined)} defaultValue="">
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="جميع أنواع الاجتماعات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الأنواع</SelectItem>
                <SelectItem value="board">مجلس إدارة</SelectItem>
                <SelectItem value="department">قسم</SelectItem>
                <SelectItem value="team">فريق</SelectItem>
                <SelectItem value="committee">لجنة</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {sortedMeetings.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد اجتماعات للعرض</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    <span>عنوان الاجتماع</span>
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    <span>التاريخ والوقت</span>
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('meeting_type')}
                >
                  <div className="flex items-center">
                    <span>النوع</span>
                    {getSortIcon('meeting_type')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('meeting_status')}
                >
                  <div className="flex items-center">
                    <span>الحالة</span>
                    {getSortIcon('meeting_status')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMeetings.map((meeting) => (
                <TableRow 
                  key={meeting.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onMeetingClick(meeting.id)}
                >
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(meeting.date)}</span>
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>{formatTime(meeting.start_time)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getMeetingTypeName(meeting.meeting_type)}</TableCell>
                  <TableCell>{getStatusBadge(meeting.meeting_status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
