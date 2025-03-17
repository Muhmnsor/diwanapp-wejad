
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingAgendaItem } from "@/components/meetings/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clipboard, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingAgendaPanelProps {
  agendaItems: MeetingAgendaItem[];
  currentItemId?: string;
  onSelectItem?: (itemId: string) => void;
}

export const MeetingAgendaPanel: React.FC<MeetingAgendaPanelProps> = ({ 
  agendaItems, 
  currentItemId,
  onSelectItem
}) => {
  if (!agendaItems || agendaItems.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="ml-2 h-5 w-5 text-primary" />
            جدول الأعمال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد بنود في جدول الأعمال
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="ml-2 h-5 w-5 text-primary" />
          جدول الأعمال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-3">
            {agendaItems
              .sort((a, b) => a.order_number - b.order_number)
              .map((item) => (
                <li 
                  key={item.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    currentItemId === item.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectItem?.(item.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Clipboard className="h-4 w-4 ml-2 text-primary" />
                      <Badge variant="outline" className="ml-2">
                        {item.order_number}
                      </Badge>
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground pr-6">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
