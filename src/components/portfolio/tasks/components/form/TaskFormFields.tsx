import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  assignedTo: string;
  setAssignedTo: (value: string) => void;
  workspaceId: string;
}

export const TaskFormFields = ({
  title,
  setTitle,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  workspaceId
}: TaskFormFieldsProps) => {
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['asana-users', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-asana-users', {
        body: { workspaceId }
      });

      if (error) {
        console.error('Error fetching Asana users:', error);
        throw error;
      }

      return data.data || [];
    }
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>عنوان المهمة</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان المهمة"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>تاريخ الاستحقاق</Label>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>الأولوية</Label>
        <Select value={priority} onValueChange={setPriority}>
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

      <div className="space-y-2">
        <Label>المسؤول</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المسؤول" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: any) => (
              <SelectItem key={user.gid} value={user.gid}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};