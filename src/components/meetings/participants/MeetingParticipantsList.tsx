
import { MeetingParticipant } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingParticipantsListProps {
  participants: MeetingParticipant[];
  isLoading: boolean;
  error: Error | null;
  meetingId?: string;
}

export const MeetingParticipantsList = ({ 
  participants, 
  isLoading, 
  error,
  meetingId
}: MeetingParticipantsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
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
          حدث خطأ أثناء تحميل المشاركين: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المشاركون</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة مشارك
        </Button>
      </div>
      
      {participants.length === 0 ? (
        <EmptyState
          title="لا يوجد مشاركون"
          description="لم تتم إضافة أي مشاركين لهذا الاجتماع بعد"
          icon={<Users className="h-8 w-8" />}
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مشارك
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <div className="p-4">قائمة المشاركين (سيتم تنفيذها لاحقًا)</div>
        </div>
      )}
    </div>
  );
};
