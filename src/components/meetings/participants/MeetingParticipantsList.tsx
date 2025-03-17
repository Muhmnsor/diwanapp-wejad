
import { useState } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserX, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AddParticipantDialog } from "./AddParticipantDialog";
import { ParticipantsTable } from "./ParticipantsTable";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingParticipantsListProps {
  participants: MeetingParticipant[];
  isLoading: boolean;
  error: Error | null;
  meetingId: string | undefined;
}

export const MeetingParticipantsList = ({ 
  participants, 
  isLoading, 
  error,
  meetingId 
}: MeetingParticipantsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المشاركين...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل قائمة المشاركين: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">المشاركون</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          إضافة مشارك
        </Button>
      </div>
      
      {participants.length === 0 ? (
        <EmptyState 
          title="لا يوجد مشاركون"
          description="لم يتم إضافة أي مشاركين إلى هذا الاجتماع بعد."
          icon={<UserPlus className="h-10 w-10 text-muted-foreground" />}
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>إضافة مشارك</Button>
          }
        />
      ) : (
        <ParticipantsTable participants={participants} meetingId={meetingId!} />
      )}
      
      <AddParticipantDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        meetingId={meetingId!}
      />
    </div>
  );
};
