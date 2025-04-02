
import { CompensationTab } from "@/components/hr/tabs/CompensationTab";

const HRCompensation = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">التعويضات والمزايا</h1>
        <p className="text-muted-foreground">إدارة الرواتب والتعويضات والمزايا للموظفين</p>
      </div>
      
      <CompensationTab />
    </div>
  );
};

export default HRCompensation;
