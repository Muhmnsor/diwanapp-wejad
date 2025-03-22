
import React from "react";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";

interface MeetingAttendeesListProps {
  attendees: string[];
  isEditing: boolean;
  onRemove: (index: number) => void;
}

export const MeetingAttendeesList: React.FC<MeetingAttendeesListProps> = ({
  attendees,
  isEditing,
  onRemove
}) => {
  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-gray-500 text-center py-2">
        لم يتم إضافة حضور بعد.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attendees.map((attendee, index) => (
        <div 
          key={index} 
          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
        >
          <User className="h-4 w-4 text-gray-500" />
          <span>{attendee}</span>
          {isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-gray-200"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
