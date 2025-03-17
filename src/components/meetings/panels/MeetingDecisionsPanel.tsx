
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { MeetingDecision } from '../types';
import { Button } from '@/components/ui/button';

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
          assignee:assigned_to (
            display_name,
            email
          )
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

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
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            تم التنفيذ
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            قيد التنفيذ
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            معلق
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>قرارات الاجتماع</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {decisions.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا توجد قرارات مسجلة لهذا الاجتماع</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {decisions.map((decision) => (
              <li key={decision.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{decision.title}</h3>
                    {decision.description && (
                      <p className="mt-1 text-muted-foreground">{decision.description}</p>
                    )}
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="text-muted-foreground">المسؤول: </span>
                        {decision.assignee?.display_name || 'غير محدد'}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">تاريخ الاستحقاق: </span>
                        {formatDate(decision.due_date)}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(decision.status)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
