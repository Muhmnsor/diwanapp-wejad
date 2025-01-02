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
      <TabsTrigger value="feedback" className="data-[state=active]:bg-white">
        التقييمات
      </TabsTrigger>
      <TabsTrigger value="preparation" className="data-[state=active]:bg-white">
        التحضير
      </TabsTrigger>
    </TabsList>
  );
};