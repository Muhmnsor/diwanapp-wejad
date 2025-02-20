
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EventTabsList = () => {
  return (
    <TabsList className="grid grid-cols-5 bg-secondary/20 p-1 rounded-xl">
      <TabsTrigger value="overview" className="data-[state=active]:bg-white">
        نظرة عامة
      </TabsTrigger>
      <TabsTrigger value="registrations" className="data-[state=active]:bg-white">
        المسجلون
      </TabsTrigger>
      <TabsTrigger value="preparation" className="data-[state=active]:bg-white">
        التحضير
      </TabsTrigger>
      <TabsTrigger value="feedback" className="data-[state=active]:bg-white">
        التقييمات
      </TabsTrigger>
      <TabsTrigger value="reports" className="data-[state=active]:bg-white">
        التقارير
      </TabsTrigger>
    </TabsList>
  );
};
