import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProjectTabsList = () => {
  return (
    <TabsList className="w-full grid grid-cols-5 bg-secondary/20 p-1 rounded-xl">
      <TabsTrigger value="overview" className="data-[state=active]:bg-white">
        نظرة عامة
      </TabsTrigger>
      <TabsTrigger value="registrations" className="data-[state=active]:bg-white">
        المسجلين
      </TabsTrigger>
      <TabsTrigger value="activities" className="data-[state=active]:bg-white">
        الأنشطة
      </TabsTrigger>
      <TabsTrigger value="preparation" className="data-[state=active]:bg-white">
        التحضير
      </TabsTrigger>
      <TabsTrigger value="reports" className="data-[state=active]:bg-white">
        التقارير
      </TabsTrigger>
    </TabsList>
  );
};