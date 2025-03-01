
import { useQuery } from "@tanstack/react-query";
import { Role } from "../types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  searchQuery: string;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export const RoleList = ({
  roles,
  isLoading,
  searchQuery,
  selectedRoleId,
  onSelectRole,
  onEditRole,
  onDeleteRole
}: RoleListProps) => {
  // استعلام للحصول على عدد المستخدمين لكل دور
  const { data: roleUserCounts = {} } = useQuery({
    queryKey: ['role-user-counts'],
    queryFn: async () => {
      // الحصول على عدد المستخدمين لكل دور باستخدام صيغة صحيحة مع Supabase
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          
          // تجميع البيانات يدويًا لحساب عدد المستخدمين لكل دور
          const countMap = {};
          result.data.forEach(item => {
            if (!countMap[item.role_id]) {
              countMap[item.role_id] = 0;
            }
            countMap[item.role_id]++;
          });
          
          return { data: countMap, error: null };
        });

      if (error) {
        console.error('Error fetching role user counts:', error);
        return {};
      }

      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border pb-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    if (searchQuery) {
      return (
        <div className="py-6 text-center text-muted-foreground bg-muted/20 rounded-md">
          لا توجد نتائج مطابقة للبحث: "{searchQuery}"
        </div>
      );
    }
    return (
      <div className="py-6 text-center text-muted-foreground bg-muted/20 rounded-md">
        لا توجد أدوار محددة. قم بإضافة دور جديد للبدء.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {roles.map((role) => (
        <div 
          key={role.id} 
          className={`flex items-center justify-between border rounded-md p-3 transition-colors 
            ${selectedRoleId === role.id 
              ? "bg-accent/30 border-accent" 
              : "border-border hover:bg-muted/20"
            }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{role.name}</h3>
              {roleUserCounts[role.id] && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {roleUserCounts[role.id]}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{role.description || "لا يوجد وصف"}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelectRole(role.id)}
              className="h-8 gap-1"
            >
              <ShieldCheck className="h-4 w-4" />
              الصلاحيات
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEditRole(role)}
              className="h-8 px-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDeleteRole(role)}
              className="h-8 px-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
