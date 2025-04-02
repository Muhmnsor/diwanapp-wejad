
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";
import { useEffect } from "react";
import { updateOrganizationalHierarchyFunction } from "@/hooks/hr/useOrganizationalUnits";
import { toast } from "@/components/ui/use-toast";

const HRSettings = () => {
  // Run once to update the database function that includes position_type
  useEffect(() => {
    const updateHierarchyFunction = async () => {
      try {
        await updateOrganizationalHierarchyFunction();
        console.log("Organizational hierarchy function successfully updated");
      } catch (err) {
        console.error("Error updating org hierarchy function:", err);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء تحديث الوظائف. قد تحتاج إلى الاتصال بالدعم الفني."
        });
      }
    };
    
    updateHierarchyFunction();
  }, []);

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
