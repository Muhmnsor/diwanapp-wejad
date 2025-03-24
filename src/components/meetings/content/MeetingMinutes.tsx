
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { Plus, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddMinutesDialog } from "../minutes/AddMinutesDialog";
import { EditMinutesDialog } from "../minutes/EditMinutesDialog";

interface MeetingMinutesProps {
  meetingId: string;
}

export const MeetingMinutes: React.FC<MeetingMinutesProps> = ({ meetingId }) => {
  const [isAddMinutesOpen, setIsAddMinutesOpen] = useState(false);
  const [isEditMinutesOpen, setIsEditMinutesOpen] = useState(false);
  const { data: minutes, isLoading, error, refetch } = useMeetingMinutes(meetingId);
  
  const handleMinutesUpdated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle>محضر الاجتماع</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 ml-2" />
            إضافة محضر
          </Button>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Skip error if it's just "no rows returned" error
    if (error && (error as any).code !== 'PGRST116') {
      console.error('Error fetching meeting minutes:', error);
      return (
        <Card className="mb-6">
          <CardHeader className="pb-3 flex justify-between items-center">
            <CardTitle>محضر الاجتماع</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsAddMinutesOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة محضر
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">حدث خطأ أثناء تحميل محضر الاجتماع</p>
          </CardContent>
        </Card>
      );
    }
  }

  const hasMinutes = minutes && Object.keys(minutes).length > 0;

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row justify-between items-center">
          <CardTitle>محضر الاجتماع</CardTitle>
          {hasMinutes ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditMinutesOpen(true)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل المحضر
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsAddMinutesOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة محضر
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasMinutes ? (
            <p className="text-gray-500 text-center py-4">لم يتم إضافة محضر للاجتماع بعد</p>
          ) : (
            <div className="space-y-4">
              {minutes.content && (
                <div className="whitespace-pre-wrap">{minutes.content}</div>
              )}
              
              {minutes.attendees && minutes.attendees.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">الحضور:</h3>
                  <ul className="list-disc list-inside">
                    {minutes.attendees.map((attendee, index) => (
                      <li key={index}>{attendee}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddMinutesDialog
        open={isAddMinutesOpen}
        onOpenChange={setIsAddMinutesOpen}
        meetingId={meetingId}
        onSuccess={handleMinutesUpdated}
      />
      
      {hasMinutes && (
        <EditMinutesDialog
          open={isEditMinutesOpen}
          onOpenChange={setIsEditMinutesOpen}
          meetingId={meetingId}
          minutes={minutes}
          onSuccess={handleMinutesUpdated}
        />
      )}
    </>
  );
};
