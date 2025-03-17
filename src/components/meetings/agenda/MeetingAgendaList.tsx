
import { useState } from "react";
import { useMeetingAgenda } from "@/hooks/meetings/useMeetingAgenda";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ListTodo } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AddAgendaItemDialog } from "./AddAgendaItemDialog";

interface MeetingAgendaListProps {
  meetingId?: string;
}

export const MeetingAgendaList = ({ meetingId }: MeetingAgendaListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { 
    data: agendaItems = [], 
    isLoading, 
    error 
  } = useMeetingAgenda(meetingId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل جدول الأعمال...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل جدول الأعمال: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">جدول الأعمال ({agendaItems.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <ListTodo className="mr-2 h-4 w-4" />
          إضافة بند
        </Button>
      </div>
      
      {agendaItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد بنود في جدول الأعمال</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة بند جديد
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {agendaItems.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      #{item.order_number}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    تعديل
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {meetingId && (
        <AddAgendaItemDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          meetingId={meetingId}
        />
      )}
    </div>
  );
};
