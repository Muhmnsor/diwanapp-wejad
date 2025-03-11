
import React from "react";

interface DashboardHeaderProps {
  userName: string;
  isLoading: boolean;
}

export const DashboardHeader = ({ userName, isLoading }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">مرحباً بك، {isLoading ? "..." : userName}</h1>
      <p className="text-gray-600 mt-2">نتمنى لك يوماً مليئاً بالإنجازات في لوحة التحكم المركزية</p>
    </div>
  );
};
