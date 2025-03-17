
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeetingDecision } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CheckSquare, Clock, User } from 'lucide-react';

interface MeetingDecisionsPanelProps {
  meetingId: string;
}

export const MeetingDecisionsPanel = ({ meetingId }: MeetingDecisionsPanelProps) => {
  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ['meeting-decisions', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_decisions')
        .select(`
          *,
          responsible_user:responsible_user_id (
            display_name,
            email
          ),
          agenda_item:agenda_item_id (
            title
          )
        `)
        .eq('meeting_id', meetingId);

      if (error) throw error;
      return data as MeetingDecision[];
    },
    enabled: !!meetingId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل القرارات...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">قيد التنفيذ</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">معلق</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>قرارات الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            لا يوجد قرارات لهذا الاجتماع
          </div>
        ) : (
          <ul className="space-y-4">
            {decisions.map((decision) => (
              <li key={decision.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{decision.decision_text}</h3>
                  {getStatusBadge(decision.status)}
                </div>
                
                {decision.agenda_item && (
                  <div className="flex items-center mb-2 text-sm">
                    <CheckSquare className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-muted-foreground">
                      بند الأجندة: {decision.agenda_item.title}
                    </span>
                  </div>
                )}
                
                {decision.responsible_user && (
                  <div className="flex items-center mb-2 text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-muted-foreground">
                      المسؤول: {decision.responsible_user.display_name || decision.responsible_user.email || 'غير محدد'}
                    </span>
                  </div>
                )}
                
                {decision.due_date && (
                  <div className="flex items-center text-sm">
                    <CalendarClock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-muted-foreground">
                      تاريخ الاستحقاق: {new Date(decision.due_date).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center text-sm mt-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-muted-foreground">
                    تاريخ الإنشاء: {new Date(decision.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
