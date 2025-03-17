
import { useState } from "react";
import { Meeting } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";
import { MeetingsFilter } from "./MeetingsFilter";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  onCreate?: () => void;
}

export const MeetingsList = ({
  meetings,
  isLoading,
  error,
  onCreate,
}: MeetingsListProps) => {
  const navigate = useNavigate();
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>(meetings);
  const [filters, setFilters] = useState<{
    status?: string;
    type?: string;
    search?: string;
  }>({});

  // Apply filters when meetings or filters change
  useState(() => {
    let result = [...meetings];

    // Apply status filter
    if (filters.status) {
      result = result.filter((meeting) => meeting.meeting_status === filters.status);
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter((meeting) => meeting.meeting_type === filters.type);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(searchLower) ||
          (meeting.objectives?.toLowerCase().includes(searchLower) || false)
      );
    }

    setFilteredMeetings(result);
  }, [meetings, filters]);

  const handleFilterChange = (newFilters: {
    status?: string;
    type?: string;
    search?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleMeetingClick = (meetingId: string) => {
    navigate(`/admin/meetings/${meetingId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-destructive">
        <p>حدث خطأ أثناء تحميل الاجتماعات</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الاجتماعات</h2>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء اجتماع
          </Button>
        )}
      </div>

      <MeetingsFilter onFilterChange={handleFilterChange} />

      {filteredMeetings.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">لا توجد اجتماعات متاحة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onClick={() => handleMeetingClick(meeting.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
