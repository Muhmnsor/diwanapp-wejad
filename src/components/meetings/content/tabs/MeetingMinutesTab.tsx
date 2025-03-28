import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Save, Paperclip, Eye, Download, Upload, Clock, Calendar, User as UserIcon } from "lucide-react";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useMeetingAgendaItems, MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingMinutes, useSaveMeetingMinutes, MeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";
interface MeetingMinutesTabProps {
  meetingId: string;
}
export const MeetingMinutesTab: React.FC<MeetingMinutesTabProps> = ({
  meetingId
}) => {
  // Fetch meeting data
  const {
    data: meeting,
    isLoading: isMeetingLoading
  } = useMeeting(meetingId);
  const {
    data: participants,
    isLoading: isParticipantsLoading
  } = useMeetingParticipants(meetingId);
  const {
    data: agendaItems,
    isLoading: isAgendaItemsLoading
  } = useMeetingAgendaItems(meetingId);
  const {
    data: existingMinutes,
    isLoading: isMinutesLoading
  } = useMeetingMinutes(meetingId);

  // Current user info
  const {
    user
  } = useAuthStore();

  // Mutation for saving minutes
  const {
    mutate: saveMinutes,
    isPending: isSaving
  } = useSaveMeetingMinutes();

  // State for the minutes form
  const [minutes, setMinutes] = useState<MeetingMinutes>({
    meeting_id: meetingId,
    introduction: '',
    conclusion: '',
    agenda_notes: {},
    attachments: []
  });

  // Preview mode toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Current date and time formatted for display
  const currentDateTime = format(new Date(), "EEEE dd MMMM yyyy الساعة hh:mm a", {
    locale: ar
  });

  // Initialize form with existing data when loaded
  useEffect(() => {
    if (existingMinutes && !isMinutesLoading) {
      setMinutes(existingMinutes);
    }
  }, [existingMinutes, isMinutesLoading]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    setMinutes(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle agenda item notes changes
  const handleAgendaNotesChange = (agendaItemId: string, notes: string) => {
    setMinutes(prev => ({
      ...prev,
      agenda_notes: {
        ...(prev.agenda_notes || {}),
        [agendaItemId]: notes
      }
    }));
  };

  // Handle save button click
  const handleSave = () => {
    saveMinutes({
      ...minutes,
      author_id: user?.id,
      author_name: user?.display_name || user?.email
    });
  };

  // Handle toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  const isLoading = isMeetingLoading || isParticipantsLoading || isAgendaItemsLoading || isMinutesLoading;
  if (isLoading) {
    return <Card>
        <CardHeader className="pb-3">
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>;
  }
  return;
};