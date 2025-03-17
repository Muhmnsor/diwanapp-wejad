
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingDecision } from "@/components/meetings/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingDecisionsPanelProps {
  decisions: MeetingDecision[];
  onSelectDecision?: (decision: MeetingDecision) => void;
}

export const MeetingDecisionsPanel: React.FC<MeetingDecisionsPanelProps> = ({ 
  decisions,
  onSelectDecision 
}) => {
  if (!decisions || decisions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="ml-2 h-5 w-5 text-primary" />
            قرارات الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد قرارات مسجلة للاجتماع
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500">منجز</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">قيد التنفيذ</Badge>;
      default:
        return <Badge className="bg-blue-500">قيد الانتظار</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="ml-2 h-5 w-5 text-primary" />
          قرارات الاجتماع ({decisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <ul className="space-y-3">
            {decisions.map((decision) => (
              <li 
                key={decision.id} 
                className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectDecision?.(decision)}
              >
                <div className="mb-2">
                  <p className="font-medium">{decision.decision_text}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {decision.responsible_user && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 ml-1 inline" />
                      {decision.responsible_user?.display_name || 'غير محدد'}
                    </div>
                  )}
                  
                  {decision.due_date && (
                    <div className="flex items-center ml-3">
                      <Calendar className="h-3 w-3 ml-1 inline" />
                      {new Date(decision.due_date).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                  
                  <div className="ml-auto">
                    {getStatusBadge(decision.status)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
