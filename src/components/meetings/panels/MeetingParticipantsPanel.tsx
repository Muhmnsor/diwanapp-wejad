
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingParticipant } from "@/components/meetings/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MeetingParticipantsPanelProps {
  participants: MeetingParticipant[];
  onSelectParticipant?: (participant: MeetingParticipant) => void;
}

export const MeetingParticipantsPanel: React.FC<MeetingParticipantsPanelProps> = ({ 
  participants,
  onSelectParticipant
}) => {
  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'chairman': return 'رئيس الاجتماع';
      case 'secretary': return 'سكرتير';
      case 'member': return 'عضو';
      case 'observer': return 'مراقب';
      default: return role;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (!participants || participants.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="ml-2 h-5 w-5 text-primary" />
            المشاركون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد مشاركون في الاجتماع
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="ml-2 h-5 w-5 text-primary" />
          المشاركون ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <ul className="space-y-3">
            {participants.map((participant) => (
              <li 
                key={participant.id} 
                className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectParticipant?.(participant)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <User className="h-4 w-4 ml-2 text-primary" />
                    <span className="font-medium">
                      {participant.user?.display_name || 'مشارك'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getRoleLabel(participant.role)}
                    </Badge>
                    {getStatusIcon(participant.attendance_status)}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground pr-6">
                  {participant.user?.email || ''}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
