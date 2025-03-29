
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllMeetings } from "@/hooks/meetings/useAllMeetings";
import { AllMeetingsTable } from "../tables/AllMeetingsTable";
import { Meeting } from "@/types/meeting";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";
import { DeleteDialog } from "@/components/ui/delete-dialog";

export const AllMeetingsTab = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const {
    data: meetings,
    isLoading,
    error,
    refetch
  } = useAllMeetings(refreshTrigger);

  const {
    mutate: deleteMeeting,
    isPending: isDeleting
  } = useDeleteMeeting();

  const handleDelete = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (meetingToDelete) {
      deleteMeeting(meetingToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }
      });
    }
  };

  return (
    <Card className="rtl text-right">
      <CardHeader>
        <CardTitle>جميع الاجتماعات</CardTitle>
        <CardDescription>عرض وإدارة جميع الاجتماعات في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <AllMeetingsTable 
          meetings={meetings || []} 
          isLoading={isLoading} 
          onDelete={handleDelete}
        />

        <DeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="حذف الاجتماع"
          description={`هل أنت متأكد من رغبتك بحذف الاجتماع "${meetingToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          onDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      </CardContent>
    </Card>
  );
};
