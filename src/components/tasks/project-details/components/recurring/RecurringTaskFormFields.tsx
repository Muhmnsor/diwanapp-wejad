
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriorityField } from "../../components/TaskPriorityField";
import { TaskAssigneeField } from "../../components/TaskAssigneeField";
import { TaskAttachmentField } from "../../components/TaskAttachmentField";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
  interval: number;
  setInterval: (interval: number) => void;
  dueDate: string;
  setDueDate: (dueDate: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  assignedTo: string | null;
  setAssignedTo: (assignedTo: string | null) => void;
  requiresDeliverable: boolean;
  setRequiresDeliverable: (requiresDeliverable: boolean) => void;
  templates: File[] | null;
  setTemplates: (templates: File[] | null) => void;
  projectMembers: ProjectMember[];
  dayOfWeek?: number;
  setDayOfWeek?: (dayOfWeek: number) => void;
  dayOfMonth?: number;
  setDayOfMonth?: (dayOfMonth: number) => void;
}

export const RecurringTaskFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  frequency,
  setFrequency,
  interval,
  setInterval,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  requiresDeliverable,
  setRequiresDeliverable,
  templates,
  setTemplates,
  projectMembers,
  dayOfWeek,
  setDayOfWeek,
  dayOfMonth,
  setDayOfMonth
}: RecurringTaskFormFieldsProps) => {
  
  // For selecting day of week
  const handleDayOfWeekChange = (value: string) => {
    if (setDayOfWeek) {
      setDayOfWeek(parseInt(value));
    }
  };

  return (
    <div className="space-y-4">
      {/* المعلومات الأساسية */}
      <div className="grid gap-2">
        <Label htmlFor="title">عنوان المهمة</Label>
        <Input
          id="title"
          placeholder="أدخل عنوان المهمة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">وصف المهمة</Label>
        <Textarea
          id="description"
          placeholder="أدخل وصف المهمة"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* معلومات التكرار */}
      <div className="grid gap-2">
        <Label htmlFor="dueDate">تاريخ البدء</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="frequency">التكرار</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع التكرار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="interval">الفاصل الزمني</Label>
          <Input
            id="interval"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value))}
            placeholder="الفاصل الزمني"
          />
        </div>
      </div>
      
      {/* إضافة حقول إضافية وفقًا لنوع التكرار */}
      {frequency === 'weekly' && setDayOfWeek && (
        <div className="grid gap-2">
          <Label htmlFor="dayOfWeek">يوم الأسبوع</Label>
          <Select 
            value={dayOfWeek?.toString() || "0"} 
            onValueChange={handleDayOfWeekChange}
          >
            <SelectTrigger id="dayOfWeek">
              <SelectValue placeholder="اختر يوم الأسبوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">الأحد</SelectItem>
              <SelectItem value="1">الإثنين</SelectItem>
              <SelectItem value="2">الثلاثاء</SelectItem>
              <SelectItem value="3">الأربعاء</SelectItem>
              <SelectItem value="4">الخميس</SelectItem>
              <SelectItem value="5">الجمعة</SelectItem>
              <SelectItem value="6">السبت</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {frequency === 'monthly' && setDayOfMonth && (
        <div className="grid gap-2">
          <Label htmlFor="dayOfMonth">يوم الشهر</Label>
          <Input
            id="dayOfMonth"
            type="number"
            min={1}
            max={31}
            value={dayOfMonth || 1}
            onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
            placeholder="اختر يوم الشهر (1-31)"
          />
        </div>
      )}

      {/* تفاصيل التكليف */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskPriorityField priority={priority} setPriority={setPriority} />
        <TaskAssigneeField 
          assignedTo={assignedTo} 
          setAssignedTo={setAssignedTo} 
          projectMembers={projectMembers} 
        />
      </div>
      
      {/* النماذج والمستلمات */}
      <TaskAttachmentField
        attachment={templates}
        setAttachment={setTemplates}
        category="template"
      />
      
      {/* إضافة الخيار لجعل المستلمات إلزامية */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox 
          id="requiresDeliverable"
          checked={requiresDeliverable}
          onCheckedChange={(checked) => setRequiresDeliverable(checked as boolean)}
        />
        <Label 
          htmlFor="requiresDeliverable" 
          className="text-sm cursor-pointer hover:text-primary transition-colors"
        >
          مستلمات المهمة إلزامية للإكمال
        </Label>
      </div>
    </div>
  );
};
