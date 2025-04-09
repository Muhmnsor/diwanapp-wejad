
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface HistoryEntry {
  id: string;
  action_type: string;
  action_by: string;
  action_date: string;
  previous_status?: string;
  new_status?: string;
  action_details?: string;
  action_by_user?: {
    display_name: string;
  };
}

interface HistoryTimelineProps {
  history: HistoryEntry[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history }) => {
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا يوجد سجل للإجراءات بعد
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6 py-2">
        {history.map((entry) => (
          <div key={entry.id} className="relative pl-8">
            <div className={cn(
              "absolute left-0 rounded-full w-8 h-8 flex items-center justify-center",
              entry.action_type === 'status_change' ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              <Clock className="h-4 w-4 text-gray-600" />
            </div>
            
            <div className="bg-white border rounded-md p-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">
                    {entry.action_type === 'status_change' ? 'تغيير الحالة' : 'إجراء على المعاملة'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    بواسطة {entry.action_by_user?.display_name || "مستخدم"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.action_date)}
                </span>
              </div>
              
              {entry.action_type === 'status_change' && entry.previous_status && entry.new_status && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-50">{entry.previous_status}</Badge>
                    <span>→</span>
                    <Badge className="bg-blue-50 text-blue-700">{entry.new_status}</Badge>
                  </div>
                </div>
              )}
              
              {entry.action_details && (
                <div className="mt-2 text-sm text-gray-600">
                  {entry.action_details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
