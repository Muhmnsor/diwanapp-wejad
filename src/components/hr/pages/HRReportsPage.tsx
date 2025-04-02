
import { ReportsTab } from "@/components/hr/tabs/ReportsTab";

const HRReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">التقارير</h1>
        <p className="text-muted-foreground">تقارير وإحصائيات شؤون الموظفين</p>
      </div>
      
      <ReportsTab />
    </div>
  );
};

export default HRReportsPage;
