
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";

const HRSettings = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إعدادات شؤون الموظفين</h1>
        <p className="text-muted-foreground">إعدادات النظام وجداول العمل والإجازات</p>
      </div>
      
      <HRSettingsTabs />
    </div>
  );
};

export default HRSettings;
