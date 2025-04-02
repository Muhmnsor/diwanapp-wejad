
import { TrainingTab } from "@/components/hr/tabs/TrainingTab";

const HRTraining = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">التدريب والتطوير</h1>
        <p className="text-muted-foreground">إدارة برامج التدريب والتطوير للموظفين</p>
      </div>
      
      <TrainingTab />
    </div>
  );
};

export default HRTraining;
