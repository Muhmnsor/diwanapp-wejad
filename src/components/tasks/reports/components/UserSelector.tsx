
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface UserSelectorProps {
  value: string;
  onChange: (userId: string) => void;
}

export const UserSelector = ({ value, onChange }: UserSelectorProps) => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      return data as User[];
    },
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    console.error("Error loading users:", error);
    return (
      <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
        خطأ في تحميل المستخدمين
      </div>
    );
  }

  return (
    <div className="w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر المستخدم" />
        </SelectTrigger>
        <SelectContent>
          {users?.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.display_name || user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
