
import React from "react";
import { Button } from "@/components/ui/button";
import { MeetingParticipant } from "@/types/meeting";
import { X, User, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MeetingParticipantListProps {
  participants: Array<Partial<MeetingParticipant> & { temp_id?: string }>;
  onRemove: (index: number) => void;
  onRoleChange: (index: number, role: string) => void;
}

export const MeetingParticipantList: React.FC<MeetingParticipantListProps> = ({
  participants,
  onRemove,
  onRoleChange,
}) => {
  return (
    <div className="space-y-2 rtl">
      {participants.length === 0 && (
        <div className="text-center p-4 border border-dashed rounded-md">
          <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">لم تتم إضافة أي مشاركين بعد</p>
        </div>
      )}
      
      {participants.map((participant, index) => (
        <div
          key={participant.temp_id || participant.id || index}
          className="flex items-center justify-between p-3 border rounded-md gap-2 rtl"
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-primary/10 p-1 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <p className="font-medium">{participant.user_display_name}</p>
              <p className="text-sm text-gray-500">{participant.user_email || "بدون بريد إلكتروني"}</p>
            </div>
          </div>

          <Select
            value={participant.role || "member"}
            onValueChange={(value) => onRoleChange(index, value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chairman">رئيس الاجتماع</SelectItem>
              <SelectItem value="secretary">مقرر</SelectItem>
              <SelectItem value="member">عضو</SelectItem>
              <SelectItem value="viewer">مشاهد</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
