
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Role } from "./types";

interface UserFormFieldsProps {
  newUsername: string;
  setNewUsername: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  roles: Role[];
  newDisplayName?: string;
  setNewDisplayName?: (value: string) => void;
}

export const UserFormFields = ({
  newUsername,
  setNewUsername,
  newPassword,
  setNewPassword,
  selectedRole,
  setSelectedRole,
  roles,
  newDisplayName = "",
  setNewDisplayName = () => {},
}: UserFormFieldsProps) => {
  console.log('Available roles:', roles);
  console.log('Selected role:', selectedRole);

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
    <div className="space-y-4 py-4 text-right">
      <div className="space-y-2">
        <Label>البريد الإلكتروني</Label>
        <Input
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="أدخل البريد الإلكتروني"
          type="email"
          dir="ltr"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <Label>المسمى الوظيفي</Label>
        <Input
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          placeholder="أدخل المسمى الوظيفي"
          dir="rtl"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <Label>كلمة المرور</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="أدخل كلمة المرور"
          dir="ltr"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <Label>الدور</Label>
        {roles && roles.length > 0 ? (
          <Select 
            value={selectedRole} 
            onValueChange={setSelectedRole}
            dir="rtl"
          >
            <SelectTrigger className="w-full text-right">
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {getRoleDisplayName(role.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground">لا توجد أدوار متاحة</div>
        )}
      </div>
    </div>
  );
};
