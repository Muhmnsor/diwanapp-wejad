
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
import { useEffect } from "react";

interface UserFormFieldsProps {
  newUsername: string;
  setNewUsername: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  roles: Role[];
}

export const UserFormFields = ({
  newUsername,
  setNewUsername,
  newPassword,
  setNewPassword,
  selectedRole,
  setSelectedRole,
  roles,
}: UserFormFieldsProps) => {
  console.log('UserFormFields - الأدوار المتاحة:', roles.map(r => `${r.id}: ${r.name}`));
  console.log('UserFormFields - الدور المحدد:', selectedRole);

  // تأكد من تعيين دور افتراضي إذا كانت هناك أدوار متاحة
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      console.log('UserFormFields - تعيين الدور الافتراضي:', roles[0].id);
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole, setSelectedRole]);

  // تحقق مما إذا كان الدور موجوداً حقاً في القائمة
  const validateRoleExists = (roleId: string) => {
    return roles.some(role => role.id === roleId);
  };

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
            onValueChange={(value) => {
              console.log("UserFormFields - تم اختيار الدور:", value);
              if (validateRoleExists(value)) {
                const roleName = roles.find(r => r.id === value)?.name;
                console.log("UserFormFields - الدور موجود في القائمة:", value, "- الاسم:", roleName);
                setSelectedRole(value);
              } else {
                console.warn("UserFormFields - تم اختيار دور غير موجود في القائمة:", value);
              }
            }}
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
