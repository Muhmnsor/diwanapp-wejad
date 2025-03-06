
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalTasksReports } from "./reports/PersonalTasksReports";
import { TeamTasksReports } from "./reports/TeamTasksReports";
import { ProjectTasksReports } from "./reports/ProjectTasksReports";
import { GeneralTasksReports } from "./reports/GeneralTasksReports";
import { UserPerformanceReport } from "./reports/UserPerformanceReport";

export const TasksReports = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">تقارير المهام والمشاريع</h2>
        
        <Tabs defaultValue="personal" dir="rtl">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="personal">التقارير الشخصية</TabsTrigger>
            <TabsTrigger value="performance">تقارير الأداء</TabsTrigger>
            <TabsTrigger value="team">تقارير الفريق</TabsTrigger>
            <TabsTrigger value="projects">تقارير المشاريع</TabsTrigger>
            <TabsTrigger value="general">تقارير المهام العامة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <PersonalTasksReports />
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <UserPerformanceReport />
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
        </Tabs>
      </Card>
    </div>
  );
};
