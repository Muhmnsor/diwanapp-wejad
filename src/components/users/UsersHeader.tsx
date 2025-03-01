
import { User as UserIcon, Shield, Filter, Users } from "lucide-react";
import { CreateUserDialog } from "./CreateUserDialog";
import type { Role, User as UserType } from "./types";

interface UsersHeaderProps {
  roles: Role[];
  users: UserType[];
  onUserCreated: () => void;
}

export const UsersHeader = ({ roles, users, onUserCreated }: UsersHeaderProps) => {
  // Count users by role
  const rolesCounts = roles.reduce((acc, role) => {
    acc[role.name] = users.filter(user => user.role === role.name).length;
    return acc;
  }, {} as Record<string, number>);

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
        </div>
        <CreateUserDialog roles={roles} onUserCreated={onUserCreated} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 mb-8">
        <div className="bg-primary/10 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">إجمالي المستخدمين</span>
          </div>
          <span className="text-2xl font-bold">{users.length}</span>
        </div>
        
        <div className="bg-primary/10 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">الأدوار والصلاحيات</span>
          </div>
          <span className="text-2xl font-bold">{roles.length}</span>
        </div>
        
        {/* عرض عدد المستخدمين حسب الدور */}
        {Object.entries(rolesCounts).map(([role, count]) => (
          <div key={role} className="bg-primary/10 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{getRoleDisplayName(role)}</span>
            </div>
            <span className="text-2xl font-bold">{count}</span>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-6">
        يمكنك إدارة المستخدمين وتعيين الأدوار المناسبة لهم من خلال الجدول أدناه
      </p>
    </div>
  );
};
