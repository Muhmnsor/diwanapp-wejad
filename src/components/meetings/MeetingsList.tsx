
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meeting } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MeetingsFilter } from "./MeetingsFilter";
import { CreateMeetingDialog } from "./dialogs/CreateMeetingDialog";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  onCreate: () => void;
}

export const MeetingsList = ({ meetings, isLoading, error, onCreate }: MeetingsListProps) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const filteredMeetings = meetings.filter(meeting => {
    if (statusFilter && meeting.meeting_status !== statusFilter) return false;
    if (typeFilter && meeting.meeting_type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        meeting.title.toLowerCase().includes(query) ||
        (meeting.objectives && meeting.objectives.toLowerCase().includes(query))
      );
    }
    return true;
  });
  
  const handleMeetingClick = (meetingId: string) => {
    navigate(`/admin/meetings/${meetingId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الاجتماعات</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          اجتماع جديد
        </Button>
      </div>
      
      <MeetingsFilter 
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onSearchChange={setSearchQuery}
      />
      
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد اجتماعات للعرض</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إنشاء اجتماع جديد
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onClick={() => handleMeetingClick(meeting.id)}
            />
          ))}
        </div>
      )}
      
      <CreateMeetingDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={onCreate}
      />
    </div>
  );
};
