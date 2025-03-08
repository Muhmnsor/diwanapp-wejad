
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalTasksReports } from "./reports/PersonalTasksReports";
import { TeamTasksReports } from "./reports/TeamTasksReports";
import { ProjectTasksReports } from "./reports/ProjectTasksReports";
import { GeneralTasksReports } from "./reports/GeneralTasksReports";
import { TopPerformersReport } from "./reports/TopPerformersReport";

export const TasksReports = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">تقارير المهام والمشاريع</h2>
        
        <Tabs defaultValue="personal" dir="rtl">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="personal">التقارير الشخصية</TabsTrigger>
            <TabsTrigger value="team">تقارير الفريق</TabsTrigger>
            <TabsTrigger value="projects">تقارير المشاريع</TabsTrigger>
            <TabsTrigger value="general">تقارير المهام العامة</TabsTrigger>
            <TabsTrigger value="top-performers">أفضل المستخدمين أداءً</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <PersonalTasksReports />
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6">
            <TeamTasksReports />
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <ProjectTasksReports />
          </TabsContent>
          
          <TabsContent value="general" className="space-y-6">
            <GeneralTasksReports />
          </TabsContent>
          
          <TabsContent value="top-performers" className="space-y-6">
            <TopPerformersReport />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
