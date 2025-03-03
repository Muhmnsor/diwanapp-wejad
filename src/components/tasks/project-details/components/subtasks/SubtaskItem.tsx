
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, Calendar, User } from "lucide-react";
import { Subtask } from './SubtasksList';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SubtaskItemProps {
  subtask: Subtask;
  onStatusChange: (subtaskId: string, newStatus: string) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, onStatusChange }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">قيد التنفيذ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">معلق</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'غير محدد';
    try {
      return format(new Date(date), 'PPP', { locale: ar });
    } catch (e) {
      return date;
    }
  };

  return (
    <div className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="font-medium">{subtask.title}</h4>
          {subtask.description && (
            <p className="text-sm text-gray-600">{subtask.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            {subtask.due_date && (
              <div className="text-xs flex items-center gap-1 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(subtask.due_date)}</span>
              </div>
            )}
            {subtask.assigned_to && (
              <div className="text-xs flex items-center gap-1 text-gray-600">
                <User className="h-3 w-3" />
                <span>{subtask.assigned_to}</span>
              </div>
            )}
            {subtask.priority && (
              <Badge variant="outline" className="text-xs">
                {subtask.priority === 'high' ? 'عالي' : 
                 subtask.priority === 'medium' ? 'متوسط' : 'منخفض'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(subtask.status)}
          {subtask.status !== 'completed' ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => onStatusChange(subtask.id, 'completed')}
            >
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs">إكمال</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => onStatusChange(subtask.id, 'in_progress')}
            >
              <Clock className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-xs">إعادة فتح</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
