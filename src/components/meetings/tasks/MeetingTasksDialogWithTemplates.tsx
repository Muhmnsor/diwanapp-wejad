import React, { useState } from "react";
import { EnhancedMeetingTasksDialog } from "./EnhancedMeetingTasksDialog";
import { TaskAttachmentField } from "@/components/tasks/project-details/components/TaskAttachmentField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { toast } from "sonner";

interface MeetingTasksDialogWithTemplatesProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MeetingTasksDialogWithTemplates: React.FC<MeetingTasksDialogWithTemplatesProps> = ({
  meetingId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  
  // Use EnhancedMeetingTasksDialog if no templates, otherwise use our custom dialog
  if (!templates) {
    return (
      <>
        <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl">إضافة نماذج للمهمة</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <TaskAttachmentField
                attachment={templates}
                setAttachment={setTemplates}
                category="template"
                label="إرفاق نماذج"
              />
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => {
                    if (templates && templates.length > 0) {
                      setIsManualDialogOpen(false);
                      // Keep the original dialog closed, as we'll use our own
                      onOpenChange(false);
                    } else {
                      toast.warning("يرجى إرفاق نموذج واحد على الأقل");
                    }
                  }}
                >
                  متابعة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      
        <EnhancedMeetingTasksDialog
          meetingId={meetingId}
          open={open}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              // Intercept the opening to show our templates dialog first
              setIsManualDialogOpen(true);
            } else {
              onOpenChange(false);
            }
          }}
          onSuccess={onSuccess}
        />
      </>
    );
  }
  
  // Our custom implementation that includes templates
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset templates when dialog is closed
        setTemplates(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة مهمة مع نماذج</DialogTitle>
        </DialogHeader>
        
        <MeetingTaskFormWithTemplates 
          meetingId={meetingId} 
          templates={templates}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
            setTemplates(null);
          }}
          onCancel={() => {
            onOpenChange(false);
            setTemplates(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

interface MeetingTaskFormWithTemplatesProps {
  meetingId: string;
  templates: File[] | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MeetingTaskFormWithTemplates: React.FC<MeetingTaskFormWithTemplatesProps> = ({
  meetingId,
  templates,
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [taskType, setTaskType] = useState<"action_item" | "follow_up" | "decision" | "preparation" | "execution" | "other">("action_item");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed" | "cancelled">("pending");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(false);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  
  const { mutate: createTask, isPending } = useCreateMeetingTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("عنوان المهمة مطلوب");
      return;
    }
    
    createTask({
      meeting_id: meetingId,
      title,
      description,
      due_date: dueDate || undefined,
      assigned_to: assignedTo,
      task_type: taskType,
      status,
      priority,
      add_to_general_tasks: addToGeneralTasks,
      requires_deliverable: requiresDeliverable,
      templates
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Task Info Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            عنوان المهمة *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            وصف المهمة
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md h-24"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              تاريخ الاستحقاق
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              الأولوية
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              className="w-full p-2 border rounded-md"
            >
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskType" className="block text-sm font-medium mb-1">
              نوع المهمة
            </label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="action_item">إجراء</option>
              <option value="follow_up">متابعة</option>
              <option value="decision">قرار</option>
              <option value="preparation">تحضيرية</option>
              <option value="execution">تنفيذية</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              الحالة
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium mb-1">
            تعيين إلى
          </label>
          <input
            id="assignedTo"
            type="text"
            value={assignedTo || ""}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="اسم المستخدم"
          />
        </div>
        
        <div className="flex items-center mt-2">
          <input
            id="addToGeneralTasks"
            type="checkbox"
            checked={addToGeneralTasks}
            onChange={(e) => setAddToGeneralTasks(e.target.checked)}
            className="ml-2"
          />
          <label htmlFor="addToGeneralTasks" className="text-sm">
            إضافة إلى المهام العامة
          </label>
        </div>
        
        <div className="flex items-center mt-2">
          <input
            id="requiresDeliverable"
            type="checkbox"
            checked={requiresDeliverable}
            onChange={(e) => setRequiresDeliverable(e.target.checked)}
            className="ml-2"
          />
          <label htmlFor="requiresDeliverable" className="text-sm">
            المهمة تتطلب مستلمات
          </label>
        </div>
        
        <div>
          <p className="block text-sm font-medium mb-1">النماذج المرفقة:</p>
          {templates && templates.length > 0 ? (
            <div className="space-y-1">
              {templates.map((file, index) => (
                <div key={index} className="p-2 bg-slate-50 rounded text-sm">
                  {file.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">لا توجد نماذج مرفقة</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "جاري الإضافة..." : "إضافة المهمة"}
        </Button>
      </div>
    </form>
  );
};
