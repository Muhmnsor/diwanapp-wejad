
import React from "react";

interface PasswordInputProps {
  newPassword: string;
  setNewPassword: (password: string) => void;
}

export const PasswordInput = ({ newPassword, setNewPassword }: PasswordInputProps) => {
  return (
    <div className="space-y-2 text-right">
      <div className="font-medium">كلمة المرور الجديدة</div>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="اترك فارغاً إذا لم ترد التغيير"
        dir="ltr"
        className="w-full px-3 py-2 border rounded-md text-right"
      />
    </div>
  );
};
