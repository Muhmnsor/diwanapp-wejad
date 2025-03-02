
import React from "react";
import { User } from "../types";

interface UserInfoDisplayProps {
  user: User | null;
}

export const UserInfoDisplay = ({ user }: UserInfoDisplayProps) => {
  // ترجمة اسم الدور للعربية
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
    <>
      <div className="space-y-2 text-right">
        <div className="font-medium">البريد الإلكتروني</div>
        <div>{user?.username}</div>
      </div>
      <div className="space-y-2 text-right">
        <div className="font-medium">الدور الحالي</div>
        <div className="text-muted-foreground">
          {user?.role ? getRoleDisplayName(user.role) : 'لم يتم تعيين دور'}
        </div>
      </div>
    </>
  );
};
