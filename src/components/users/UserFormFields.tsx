import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Role } from "./types";

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
    <div className="space-y-4 py-4">
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
        <RadioGroup
          value={selectedRole}
          onValueChange={setSelectedRole}
          className="flex flex-col space-y-2"
        >
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value={role.id} id={role.id} />
              <Label htmlFor={role.id} className="mr-2">
                {getRoleDisplayName(role.name)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};