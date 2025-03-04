
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types/addTask";

interface TaskAssigneeFieldProps {
  assignedTo: string;
  onAssignedToChange: (userId: string) => void;
}

export const TaskAssigneeField = ({ assignedTo, onAssignedToChange }: TaskAssigneeFieldProps) => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name', { ascending: true });

        if (error) {
          console.error("خطأ في جلب المستخدمين:", error);
          return;
        }

        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error("خطأ في جلب المستخدمين:", error);
      }
    };

    fetchUsers();
  }, []);
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="assigned-to">تعيين إلى</Label>
      <Select 
        value={assignedTo} 
        onValueChange={onAssignedToChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر المسؤول عن المهمة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" key="none">غير مسند</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.display_name || user.email || user.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
