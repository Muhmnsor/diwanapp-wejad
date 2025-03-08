
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectMember } from "@/components/tasks/project-details/types/projectMember";

interface Project {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface RecurringTaskFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  recurrenceType: string;
  setRecurrenceType: (value: string) => void;
  interval: number;
  setInterval: (value: number) => void;
  dayOfMonth: number | null;
  setDayOfMonth: (value: number | null) => void;
  projectId: string | null;
  setProjectId: (value: string | null) => void;
  workspaceId: string | null;
  setWorkspaceId: (value: string | null) => void;
  priority: string;
  setPriority: (value: string) => void;
  category: string | null;
  setCategory: (value: string | null) => void;
  assignTo: string | null;
  setAssignTo: (value: string | null) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  projects: Project[];
  workspaces: Workspace[];
  projectMembers: ProjectMember[];
  requiresDeliverable: boolean;
  setRequiresDeliverable: (value: boolean) => void;
}

export const RecurringTaskFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  recurrenceType,
  setRecurrenceType,
  interval,
  setInterval,
  dayOfMonth,
  setDayOfMonth,
  projectId,
  setProjectId,
  workspaceId,
  setWorkspaceId,
  priority,
  setPriority,
  category,
  setCategory,
  assignTo,
  setAssignTo,
  isActive,
  setIsActive,
  projects,
  workspaces,
  projectMembers,
  requiresDeliverable,
  setRequiresDeliverable
}: RecurringTaskFormFieldsProps) => {
  const isGeneral = !projectId && !workspaceId;

  const handleTaskTypeChange = (type: string) => {
    if (type === 'general') {
      setProjectId(null);
      setWorkspaceId(null);
    } else if (type === 'project') {
      setWorkspaceId(null);
    } else if (type === 'workspace') {
      setProjectId(null);
    }
  };

  const taskTypes = [
    { id: 'general', label: 'مهمة عامة' },
    { id: 'project', label: 'مهمة مشروع' },
    { id: 'workspace', label: 'مهمة مساحة عمل' }
  ];

  const recurrenceTypes = [
    { id: 'monthly', label: 'شهري' },
    { id: 'weekly', label: 'أسبوعي' },
    { id: 'daily', label: 'يومي' }
  ];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">عنوان المهمة</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان المهمة المتكررة"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المهمة</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصف المهمة المتكررة"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>نوع المهمة</Label>
        <RadioGroup
          defaultValue={!projectId && !workspaceId ? 'general' : projectId ? 'project' : 'workspace'}
          className="flex gap-4"
          onValueChange={handleTaskTypeChange}
        >
          {taskTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value={type.id} id={`task-type-${type.id}`} />
              <Label htmlFor={`task-type-${type.id}`}>{type.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Project Selection */}
      {!workspaceId && (
        <div className="space-y-2">
          <Label htmlFor="project">المشروع</Label>
          <Select
            value={projectId || ""}
            onValueChange={(value) => {
              if (value === "") {
                setProjectId(null);
              } else {
                setProjectId(value);
                setWorkspaceId(null);
              }
            }}
            disabled={Boolean(workspaceId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">لا يوجد (مهمة عامة)</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Workspace Selection */}
      {!projectId && (
        <div className="space-y-2">
          <Label htmlFor="workspace">مساحة العمل</Label>
          <Select
            value={workspaceId || ""}
            onValueChange={(value) => {
              if (value === "") {
                setWorkspaceId(null);
              } else {
                setWorkspaceId(value);
                setProjectId(null);
              }
            }}
            disabled={Boolean(projectId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر مساحة العمل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">لا يوجد (مهمة عامة)</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Recurrence Type */}
      <div className="space-y-2">
        <Label>نوع التكرار</Label>
        <RadioGroup
          value={recurrenceType}
          onValueChange={setRecurrenceType}
          className="flex gap-4"
        >
          {recurrenceTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value={type.id} id={`recurrence-${type.id}`} />
              <Label htmlFor={`recurrence-${type.id}`}>{type.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Day of Month for Monthly recurrence */}
      {recurrenceType === 'monthly' && (
        <div className="space-y-2">
          <Label htmlFor="day-of-month">اليوم من الشهر</Label>
          <Select
            value={dayOfMonth?.toString() || "1"}
            onValueChange={(value) => setDayOfMonth(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر اليوم" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Interval */}
      <div className="space-y-2">
        <Label htmlFor="interval">التكرار كل</Label>
        <div className="flex items-center gap-2">
          <Input
            id="interval"
            type="number"
            min={1}
            max={12}
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <span>
            {recurrenceType === 'monthly' ? 'شهر' : recurrenceType === 'weekly' ? 'أسبوع' : 'يوم'}
          </span>
        </div>
      </div>

      {/* Task Category for General Tasks */}
      {isGeneral && (
        <div className="space-y-2">
          <Label htmlFor="category">فئة المهمة</Label>
          <Select
            value={category || "إدارية"}
            onValueChange={setCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="إدارية">إدارية</SelectItem>
              <SelectItem value="مالية">مالية</SelectItem>
              <SelectItem value="تقنية">تقنية</SelectItem>
              <SelectItem value="تسويقية">تسويقية</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">الأولوية</Label>
        <Select
          value={priority}
          onValueChange={setPriority}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الأولوية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">منخفضة</SelectItem>
            <SelectItem value="medium">متوسطة</SelectItem>
            <SelectItem value="high">عالية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignee */}
      <div className="space-y-2">
        <Label htmlFor="assignee">تعيين إلى</Label>
        <Select
          value={assignTo || ""}
          onValueChange={(value) => setAssignTo(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر المكلف بالمهمة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">غير محدد</SelectItem>
            {projectMembers.map((member) => (
              <SelectItem key={member.user_id} value={member.user_id}>
                {member.display_name || member.user_email || "مستخدم"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Required Deliverables */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox 
          id="requiresDeliverable"
          checked={requiresDeliverable}
          onCheckedChange={(checked) => setRequiresDeliverable(checked as boolean)}
        />
        <Label 
          htmlFor="requiresDeliverable" 
          className="text-sm cursor-pointer"
        >
          مستلمات المهمة إلزامية للإكمال
        </Label>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <Label htmlFor="active-status">حالة المهمة المتكررة</Label>
        <div className="flex items-center gap-2">
          <Switch
            id="active-status"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="active-status" className="cursor-pointer">
            {isActive ? "نشطة" : "غير نشطة"}
          </Label>
        </div>
      </div>
    </>
  );
};
